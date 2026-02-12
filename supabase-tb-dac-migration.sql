-- Criação da tabela tb_dac para rastreamento de DACs gerados
CREATE TABLE IF NOT EXISTS public.tb_dac (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dac_number VARCHAR(20) NOT NULL,
  nome_pessoa VARCHAR(255) NOT NULL,
  cpf_cnpj_pessoa VARCHAR(20) NOT NULL,
  valor_liquido DECIMAL(15, 2) NOT NULL,
  descricao_servico TEXT NOT NULL,
  nome_empresa VARCHAR(255) NOT NULL,
  cnpj_empresa VARCHAR(20) NOT NULL,
  usuario_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL
);

-- Índices para otimizar consultas de duplicidade
CREATE INDEX IF NOT EXISTS idx_tb_dac_cnpj_empresa ON public.tb_dac(cnpj_empresa);
CREATE INDEX IF NOT EXISTS idx_tb_dac_valor_liquido ON public.tb_dac(valor_liquido);
CREATE INDEX IF NOT EXISTS idx_tb_dac_created_at ON public.tb_dac(created_at);
CREATE INDEX IF NOT EXISTS idx_tb_dac_duplicity_check ON public.tb_dac(cnpj_empresa, valor_liquido, created_at);

-- Criação da tabela tb_dac_config para armazenar configurações
CREATE TABLE IF NOT EXISTS public.tb_dac_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  intervalo_dias INTEGER DEFAULT 30 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL
);

-- Inserir configuração padrão (30 dias)
INSERT INTO public.tb_dac_config (intervalo_dias)
VALUES (30)
ON CONFLICT DO NOTHING;

-- Comentários nas tabelas
COMMENT ON TABLE public.tb_dac IS 'Tabela para rastreamento de DACs (Documentos de Arrecadação) gerados';
COMMENT ON TABLE public.tb_dac_config IS 'Tabela de configurações do sistema de geração de DAC';

COMMENT ON COLUMN public.tb_dac.dac_number IS 'Número único do DAC gerado (timestamp)';
COMMENT ON COLUMN public.tb_dac.cpf_cnpj_pessoa IS 'CPF ou CNPJ do recebedor';
COMMENT ON COLUMN public.tb_dac.cnpj_empresa IS 'CNPJ da empresa pagadora';
COMMENT ON COLUMN public.tb_dac.valor_liquido IS 'Valor líquido do pagamento';
COMMENT ON COLUMN public.tb_dac_config.intervalo_dias IS 'Intervalo em dias para verificação de duplicidade';
