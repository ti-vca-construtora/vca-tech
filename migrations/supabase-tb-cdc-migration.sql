-- Migration: Create tb_cdc table for gerador-dac companies
-- Description: Keep tb_empresas for RPS and isolate DAC company source in tb_cdc

CREATE TABLE IF NOT EXISTS public.tb_cdc (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id BIGINT NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20) NOT NULL,
  trade_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tb_cdc_cnpj ON public.tb_cdc(cnpj);
CREATE INDEX IF NOT EXISTS idx_tb_cdc_trade_name ON public.tb_cdc(trade_name);
CREATE INDEX IF NOT EXISTS idx_tb_cdc_external_id ON public.tb_cdc(external_id);

COMMENT ON TABLE public.tb_cdc IS 'Tabela de empresas para o gerador-rps';
COMMENT ON COLUMN public.tb_cdc.external_id IS 'ID da empresa no Sienge';
COMMENT ON COLUMN public.tb_cdc.cnpj IS 'CNPJ da empresa';
COMMENT ON COLUMN public.tb_cdc.trade_name IS 'Nome fantasia para exibição no formulário RPS';

-- Backfill inicial da tb_cdc a partir da tb_empresas para preservar referências históricas
INSERT INTO public.tb_cdc (id, external_id, name, cnpj, trade_name)
SELECT e.id, e.external_id, e.name, e.cnpj, e.trade_name
FROM public.tb_empresas e
ON CONFLICT (external_id) DO UPDATE
SET
  name = EXCLUDED.name,
  cnpj = EXCLUDED.cnpj,
  trade_name = EXCLUDED.trade_name,
  updated_at = timezone('America/Sao_Paulo'::text, now());

-- Se houver divergência de IDs entre tb_empresas e tb_cdc para o mesmo external_id,
-- remapeia o company_id de tb_dac para o ID correto da tb_cdc
UPDATE public.tb_dac d
SET company_id = c.id
FROM public.tb_empresas e
JOIN public.tb_cdc c ON c.external_id = e.external_id
WHERE d.company_id = e.id
  AND d.company_id IS DISTINCT FROM c.id;

-- Limpa referências órfãs para permitir criação da nova FK sem falha
UPDATE public.tb_dac d
SET company_id = NULL
WHERE d.company_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.tb_cdc c
    WHERE c.id = d.company_id
  );

-- Garante FK de company_id da tb_dac para tb_empresas (mapeamento invertido)
ALTER TABLE public.tb_dac
  DROP CONSTRAINT IF EXISTS tb_dac_company_id_fkey;

DO $$
DECLARE
  existing_fk_name TEXT;
BEGIN
  SELECT tc.constraint_name
  INTO existing_fk_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
   AND tc.table_schema = kcu.table_schema
  WHERE tc.table_schema = 'public'
    AND tc.table_name = 'tb_dac'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'company_id'
  LIMIT 1;

  IF existing_fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.tb_dac DROP CONSTRAINT %I', existing_fk_name);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tb_dac_company_id_fkey'
      AND conrelid = 'public.tb_dac'::regclass
  ) THEN
    ALTER TABLE public.tb_dac
      ADD CONSTRAINT tb_dac_company_id_fkey
      FOREIGN KEY (company_id)
      REFERENCES public.tb_empresas(id)
      ON DELETE SET NULL;
  END IF;
END $$;

COMMENT ON COLUMN public.tb_dac.company_id IS 'ID da empresa pagadora no sistema (FK para tb_empresas)';
