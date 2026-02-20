-- Migration para atualizar tb_dac com novos campos do formulário
-- Data: 2024
-- Descrição: Adicionar campos detalhados do recebedor (RG, nome da mãe, data nascimento, PIS, estado, município)
--           e campos de pagamento (forma_pagamento, dados PIX e bancários)

-- 1. Renomear colunas antigas para novo padrão
ALTER TABLE public.tb_dac 
  RENAME COLUMN nome_pessoa TO nome_razao_social;

ALTER TABLE public.tb_dac 
  RENAME COLUMN cpf_cnpj_pessoa TO cpf;

-- 2. Adicionar novos campos do recebedor
ALTER TABLE public.tb_dac
  ADD COLUMN IF NOT EXISTS rg VARCHAR(20),
  ADD COLUMN IF NOT EXISTS nome_mae VARCHAR(255),
  ADD COLUMN IF NOT EXISTS data_nascimento DATE,
  ADD COLUMN IF NOT EXISTS pis VARCHAR(20),
  ADD COLUMN IF NOT EXISTS estado VARCHAR(2),
  ADD COLUMN IF NOT EXISTS municipio VARCHAR(255);

-- 3. Adicionar campos de pagamento
ALTER TABLE public.tb_dac
  ADD COLUMN IF NOT EXISTS forma_pagamento VARCHAR(10) CHECK (forma_pagamento IN ('PIX', 'TED')),
  ADD COLUMN IF NOT EXISTS tipo_chave_pix VARCHAR(20) CHECK (tipo_chave_pix IN ('CPF', 'CNPJ', 'Email', 'Telefone', 'Chave Aleatória')),
  ADD COLUMN IF NOT EXISTS chave_pix VARCHAR(255),
  ADD COLUMN IF NOT EXISTS banco VARCHAR(100),
  ADD COLUMN IF NOT EXISTS agencia VARCHAR(20),
  ADD COLUMN IF NOT EXISTS conta VARCHAR(30),
  ADD COLUMN IF NOT EXISTS tipo_conta VARCHAR(20) CHECK (tipo_conta IN ('CORRENTE', 'POUPANCA')),
  ADD COLUMN IF NOT EXISTS cpf_cnpj_conta VARCHAR(20);

-- 4. Adicionar company_id (se ainda não existe)
ALTER TABLE public.tb_dac
  ADD COLUMN IF NOT EXISTS company_id UUID;

-- 5. Criar índices para novos campos
CREATE INDEX IF NOT EXISTS idx_tb_dac_cpf ON public.tb_dac(cpf);
CREATE INDEX IF NOT EXISTS idx_tb_dac_estado ON public.tb_dac(estado);
CREATE INDEX IF NOT EXISTS idx_tb_dac_company_id ON public.tb_dac(company_id);

-- 6. Atualizar índice existente que referenciava cpf_cnpj_pessoa
DROP INDEX IF EXISTS idx_tb_dac_duplicity_check;
CREATE INDEX IF NOT EXISTS idx_tb_dac_duplicity_check ON public.tb_dac(cnpj_empresa, valor_liquido, created_at);

-- 7. Atualizar comentários
COMMENT ON COLUMN public.tb_dac.nome_razao_social IS 'Nome completo ou razão social do recebedor';
COMMENT ON COLUMN public.tb_dac.cpf IS 'CPF do recebedor (somente CPF, não CNPJ)';
COMMENT ON COLUMN public.tb_dac.rg IS 'RG do recebedor';
COMMENT ON COLUMN public.tb_dac.nome_mae IS 'Nome da mãe do recebedor';
COMMENT ON COLUMN public.tb_dac.data_nascimento IS 'Data de nascimento do recebedor';
COMMENT ON COLUMN public.tb_dac.pis IS 'Número PIS do recebedor';
COMMENT ON COLUMN public.tb_dac.estado IS 'UF do estado do recebedor (sigla)';
COMMENT ON COLUMN public.tb_dac.municipio IS 'Município do recebedor';
COMMENT ON COLUMN public.tb_dac.forma_pagamento IS 'Forma de pagamento: PIX ou TED';
COMMENT ON COLUMN public.tb_dac.tipo_chave_pix IS 'Tipo de chave PIX (CPF, CNPJ, Email, Telefone, Chave Aleatória)';
COMMENT ON COLUMN public.tb_dac.chave_pix IS 'Chave PIX do recebedor';
COMMENT ON COLUMN public.tb_dac.banco IS 'Nome do banco para pagamento via TED';
COMMENT ON COLUMN public.tb_dac.agencia IS 'Agência bancária';
COMMENT ON COLUMN public.tb_dac.conta IS 'Número da conta bancária';
COMMENT ON COLUMN public.tb_dac.tipo_conta IS 'Tipo de conta: CORRENTE ou POUPANCA';
COMMENT ON COLUMN public.tb_dac.cpf_cnpj_conta IS 'CPF ou CNPJ do titular da conta';
COMMENT ON COLUMN public.tb_dac.company_id IS 'ID da empresa no sistema (FK para tb_empresas)';

-- 8. Criar tabela de cadastros para busca rápida no formulário
CREATE TABLE IF NOT EXISTS public.tb_dac_cadastros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_razao_social VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) NOT NULL,
  rg VARCHAR(20),
  nome_mae VARCHAR(255),
  data_nascimento DATE,
  pis VARCHAR(20),
  estado VARCHAR(2),
  municipio VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL,
  UNIQUE(cpf)
);

-- 9. Criar índices para tb_dac_cadastros
CREATE INDEX IF NOT EXISTS idx_tb_dac_cadastros_nome ON public.tb_dac_cadastros(nome_razao_social);
CREATE INDEX IF NOT EXISTS idx_tb_dac_cadastros_cpf ON public.tb_dac_cadastros(cpf);

-- 10. Comentários para tb_dac_cadastros
COMMENT ON TABLE public.tb_dac_cadastros IS 'Cadastro de recebedores para preenchimento automático no formulário DAC';
COMMENT ON COLUMN public.tb_dac_cadastros.nome_razao_social IS 'Nome completo do recebedor';
COMMENT ON COLUMN public.tb_dac_cadastros.cpf IS 'CPF do recebedor (único)';

-- 11. Popular tb_dac_cadastros com dados existentes da tb_dac (deduplica por CPF)
INSERT INTO public.tb_dac_cadastros (nome_razao_social, cpf, rg, nome_mae, data_nascimento, pis, estado, municipio)
SELECT DISTINCT ON (cpf) 
  nome_razao_social, 
  cpf, 
  rg, 
  nome_mae, 
  data_nascimento, 
  pis, 
  estado, 
  municipio
FROM public.tb_dac
WHERE cpf IS NOT NULL AND nome_razao_social IS NOT NULL
ORDER BY cpf, created_at DESC
ON CONFLICT (cpf) DO NOTHING;

-- 12. Criar função para atualizar tb_dac_cadastros automaticamente quando novo DAC é inserido
CREATE OR REPLACE FUNCTION public.update_dac_cadastros()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.tb_dac_cadastros (
    nome_razao_social, cpf, rg, nome_mae, data_nascimento, pis, estado, municipio
  )
  VALUES (
    NEW.nome_razao_social, NEW.cpf, NEW.rg, NEW.nome_mae, NEW.data_nascimento, NEW.pis, NEW.estado, NEW.municipio
  )
  ON CONFLICT (cpf) 
  DO UPDATE SET
    nome_razao_social = EXCLUDED.nome_razao_social,
    rg = EXCLUDED.rg,
    nome_mae = EXCLUDED.nome_mae,
    data_nascimento = EXCLUDED.data_nascimento,
    pis = EXCLUDED.pis,
    estado = EXCLUDED.estado,
    municipio = EXCLUDED.municipio,
    updated_at = timezone('America/Sao_Paulo'::text, now());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. Criar trigger para chamar a função
DROP TRIGGER IF EXISTS trigger_update_dac_cadastros ON public.tb_dac;
CREATE TRIGGER trigger_update_dac_cadastros
  AFTER INSERT ON public.tb_dac
  FOR EACH ROW
  EXECUTE FUNCTION public.update_dac_cadastros();

-- 14. Limpar duplicatas da tb_dac_config (manter apenas o registro mais antigo)
DO $$
DECLARE
  oldest_config_id UUID;
BEGIN
  -- Pegar o ID do registro mais antigo
  SELECT id INTO oldest_config_id
  FROM public.tb_dac_config
  ORDER BY created_at ASC
  LIMIT 1;
  
  -- Deletar todos os outros registros (mantém apenas o mais antigo)
  IF oldest_config_id IS NOT NULL THEN
    DELETE FROM public.tb_dac_config
    WHERE id != oldest_config_id;
  END IF;
END $$;

-- 15. Adicionar constraint para garantir apenas 1 registro na tb_dac_config
-- Criar uma coluna singleton com valor fixo e adicionar constraint UNIQUE
ALTER TABLE public.tb_dac_config 
  ADD COLUMN IF NOT EXISTS singleton_guard INTEGER DEFAULT 1;

-- Limpar se já existir
DROP INDEX IF EXISTS idx_tb_dac_config_singleton;
CREATE UNIQUE INDEX idx_tb_dac_config_singleton ON public.tb_dac_config(singleton_guard);

-- Garantir que sempre há exatamente 1 registro
INSERT INTO public.tb_dac_config (intervalo_dias, singleton_guard)
VALUES (30, 1)
ON CONFLICT (singleton_guard) DO NOTHING;

-- Finalizado!
