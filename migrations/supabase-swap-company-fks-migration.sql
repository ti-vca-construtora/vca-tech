-- Migration: Swap company foreign keys after table naming inversion
-- DAC deve referenciar tb_empresas
-- RPS deve referenciar tb_cdc

-- 1) Remapear company_id do tb_dac (tb_cdc -> tb_empresas) por external_id
UPDATE public.tb_dac d
SET company_id = e.id
FROM public.tb_cdc c
JOIN public.tb_empresas e ON e.external_id = c.external_id
WHERE d.company_id = c.id
  AND d.company_id IS DISTINCT FROM e.id;

-- 2) Limpar órfãos do tb_dac
UPDATE public.tb_dac d
SET company_id = NULL
WHERE d.company_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.tb_empresas e WHERE e.id = d.company_id
  );

-- 3) Remapear company_id do tb_rps (tb_empresas -> tb_cdc) por external_id
UPDATE public.tb_rps r
SET company_id = c.id
FROM public.tb_empresas e
JOIN public.tb_cdc c ON c.external_id = e.external_id
WHERE r.company_id = e.id
  AND r.company_id IS DISTINCT FROM c.id;

-- 4) Limpar órfãos do tb_rps
UPDATE public.tb_rps r
SET company_id = NULL
WHERE r.company_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.tb_cdc c WHERE c.id = r.company_id
  );

-- 5) Remover FKs antigas (se existirem)
ALTER TABLE public.tb_dac DROP CONSTRAINT IF EXISTS tb_dac_company_id_fkey;
ALTER TABLE public.tb_rps DROP CONSTRAINT IF EXISTS tb_rps_company_id_fkey;

-- 6) Recriar FKs com o mapeamento invertido
ALTER TABLE public.tb_dac
  ADD CONSTRAINT tb_dac_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES public.tb_empresas(id)
  ON DELETE SET NULL;

ALTER TABLE public.tb_rps
  ADD CONSTRAINT tb_rps_company_id_fkey
  FOREIGN KEY (company_id)
  REFERENCES public.tb_cdc(id)
  ON DELETE SET NULL;

COMMENT ON COLUMN public.tb_dac.company_id IS 'ID da empresa pagadora no sistema (FK para tb_empresas)';
COMMENT ON COLUMN public.tb_rps.company_id IS 'ID da empresa pagadora no sistema (FK para tb_cdc)';
