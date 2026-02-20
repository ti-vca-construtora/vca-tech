-- Criar tabela para cadastros de pessoas (RPS)
CREATE TABLE IF NOT EXISTS tb_rps_cadastros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_razao_social TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    rg TEXT NOT NULL,
    data_nascimento DATE,
    nome_mae TEXT NOT NULL,
    pis TEXT,
    estado TEXT NOT NULL,
    municipio TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_rps_cadastros_cpf ON tb_rps_cadastros(cpf);
CREATE INDEX IF NOT EXISTS idx_rps_cadastros_nome ON tb_rps_cadastros(nome_razao_social);

-- Criar tabela para RPS gerados
CREATE TABLE IF NOT EXISTS tb_rps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rps_number TEXT NOT NULL UNIQUE,
    nome_razao_social TEXT NOT NULL,
    cpf TEXT NOT NULL,
    rg TEXT NOT NULL,
    data_nascimento DATE,
    nome_mae TEXT NOT NULL,
    pis TEXT,
    estado TEXT NOT NULL,
    municipio TEXT NOT NULL,
    descricao_servico TEXT NOT NULL,
    valor_liquido DECIMAL(10,2) NOT NULL,
    forma_pagamento TEXT NOT NULL,
    tipo_chave_pix TEXT,
    chave_pix TEXT,
    banco TEXT,
    tipo_conta TEXT,
    agencia TEXT,
    conta TEXT,
    cpf_cnpj_conta TEXT,
    dados_terceiros BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhorar performance e verificação de duplicidade
CREATE INDEX IF NOT EXISTS idx_rps_cpf ON tb_rps(cpf);
CREATE INDEX IF NOT EXISTS idx_rps_valor_liquido ON tb_rps(valor_liquido);
CREATE INDEX IF NOT EXISTS idx_rps_cpf_valor ON tb_rps(cpf, valor_liquido);
CREATE INDEX IF NOT EXISTS idx_rps_created_at ON tb_rps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rps_number ON tb_rps(rps_number);

-- Adicionar comentários
COMMENT ON TABLE tb_rps_cadastros IS 'Cadastros de pessoas para pré-seleção no gerador de RPS';
COMMENT ON TABLE tb_rps IS 'Registro de todos os RPS gerados pelo sistema';

-- Conceder permissões (ajustar conforme necessário)
-- GRANT ALL ON tb_rps_cadastros TO authenticated;
-- GRANT ALL ON tb_rps TO authenticated;
