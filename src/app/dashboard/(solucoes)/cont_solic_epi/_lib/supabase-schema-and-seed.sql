-- ============================================
-- SCHEMA + SEED DATA - Controle e Solicitação de EPIs
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- ============================================
-- 1. CRIAR TABELAS
-- ============================================

-- Criar ENUM para tipos de empreendimento
CREATE TYPE empreendimento_tipo AS ENUM ('INCORPORACAO', 'LOTEAMENTO');

-- Tabela de EPIs (Equipamentos de Proteção Individual)
CREATE TABLE IF NOT EXISTS epi_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Funções (cargos/funções dos trabalhadores)
CREATE TABLE IF NOT EXISTS funcoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Obras
CREATE TABLE IF NOT EXISTS obras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  empreendimento_tipo empreendimento_tipo NOT NULL DEFAULT 'INCORPORACAO',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento Função-EPI (configuração)
-- interval_months: intervalo de reposição em meses (para cálculo de necessidade de efetivos)
-- quantity_per_employee: quantidade que cada funcionário projetado recebe
-- empreendimento_tipo: tipo de obra (INCORPORACAO ou LOTEAMENTO) para diferentes configurações
CREATE TABLE IF NOT EXISTS funcao_epi_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao_id UUID NOT NULL REFERENCES funcoes(id) ON DELETE CASCADE,
  epi TEXT NOT NULL,
  interval_months NUMERIC NOT NULL CHECK (interval_months > 0),
  quantity_per_employee NUMERIC NOT NULL DEFAULT 1 CHECK (quantity_per_employee >= 0),
  empreendimento_tipo empreendimento_tipo NOT NULL DEFAULT 'INCORPORACAO',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(funcao_id, epi, empreendimento_tipo)
);

-- Tabela de snapshots de inventário (histórico de estoque)
CREATE TABLE IF NOT EXISTS inventory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  funcao_id UUID NOT NULL REFERENCES funcoes(id) ON DELETE CASCADE,
  epi TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  snapshot_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_funcao_epi_items_funcao_id ON funcao_epi_items(funcao_id);
CREATE INDEX IF NOT EXISTS idx_funcao_epi_items_epi ON funcao_epi_items(epi);
CREATE INDEX IF NOT EXISTS idx_funcao_epi_items_tipo ON funcao_epi_items(empreendimento_tipo);
CREATE INDEX IF NOT EXISTS idx_obras_tipo ON obras(empreendimento_tipo);
CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_obra_funcao ON inventory_snapshots(obra_id, funcao_id);
CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_date ON inventory_snapshots(snapshot_date);

-- ============================================
-- 2. INSERIR EPIs
-- ============================================
INSERT INTO epi_items (id, name) VALUES
(gen_random_uuid(), 'ABAFADOR DE RUÍDO PARA ACOPLAR'),
(gen_random_uuid(), 'AVENTAL DE RASPA'),
(gen_random_uuid(), 'BOTA DE ADMINISTRATIVO'),
(gen_random_uuid(), 'BOTA DE BORRACHA'),
(gen_random_uuid(), 'BOTA DE COURO'),
(gen_random_uuid(), 'CALÇA DA FARDA DA EMPRESA'),
(gen_random_uuid(), 'CAMISA DA FARDA'),
(gen_random_uuid(), 'CAPACETE (DETALHE AMARELO)'),
(gen_random_uuid(), 'CAPACETE (DETALHE AZUL)'),
(gen_random_uuid(), 'CAPACETE (DETALHE BRANCO)'),
(gen_random_uuid(), 'CAPACETE (DETALHE CINZA)'),
(gen_random_uuid(), 'CAPACETE (DETALHE MARROM)'),
(gen_random_uuid(), 'CAPACETE (DETALHE VERDE)'),
(gen_random_uuid(), 'CAPACETE (DETALHE VERMELHO)'),
(gen_random_uuid(), 'CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)'),
(gen_random_uuid(), 'FARDAMENTO ANTI-CHAMAS (AVENTAL COM MANGAS) - C.A. 35236'),
(gen_random_uuid(), 'FILTRO PARA MÁSCARA'),
(gen_random_uuid(), 'RESPIRADOR FACIAL 1/4  COM FILTRO'),
(gen_random_uuid(), 'JOELHEIRA DE PROTEÇÃO'),
(gen_random_uuid(), 'LENTE FILTRO DE LUZ PARA MÁSCARA DE SOLDA'),
(gen_random_uuid(), 'LUVA DE POLIÉSTER COM BANHO DE LÁTEX CORRUGADO SS1009 - SUPER SAFFETY / CA - 31895'),
(gen_random_uuid(), 'LUVA DE VAQUETA'),
(gen_random_uuid(), 'LUVA EM HELANCA PU'),
(gen_random_uuid(), 'LUVA LÁTEX - LARANJA REFORÇADA'),
(gen_random_uuid(), 'LUVA VULCANIZADA'),
(gen_random_uuid(), 'MACACÃO DE PROTEÇÃO AZUL'),
(gen_random_uuid(), 'MÁSCARA DESCARTÁVEL'),
(gen_random_uuid(), 'MASCARA SOLDA AUTOMÁTICA S/ REGULAGEM 3 A 11 V8'),
(gen_random_uuid(), 'ÓCULOS AMPLA VISÃO'),
(gen_random_uuid(), 'ÓCULOS DE PROTEÇÃO ESCURO'),
(gen_random_uuid(), 'ÓCULOS DE PROTEÇÃO TRANSPARENTE'),
(gen_random_uuid(), 'PERNEIRA DE COURO SINTÉTICO'),
(gen_random_uuid(), 'PROTETOR AURICULAR TAPA OUVIDOS (PLUG)'),
(gen_random_uuid(), 'PROTETOR AURICULAR TIPO CONCHA'),
(gen_random_uuid(), 'PROTETOR SOLAR');

-- ============================================
-- 3. INSERIR FUNÇÕES
-- ============================================
INSERT INTO funcoes (id, name) VALUES
(gen_random_uuid(), 'ADMINISTRATIVO'),
(gen_random_uuid(), 'ALVENARIA (PEDREIROS)'),
(gen_random_uuid(), 'ALVENARIA (SERVENTES)'),
(gen_random_uuid(), 'ALMOXARIFADO - CASA DE QUÍMICOS (ALMOXARIFE E AUXILIAR DE ALMOXARIFE)'),
(gen_random_uuid(), 'ARMAÇÃO (ARMADORES E AUXILIARES)'),
(gen_random_uuid(), 'ARMAÇÃO (SERVENTES)'),
(gen_random_uuid(), 'BETONEIRA (OPERADORES DE BETONEIRA)'),
(gen_random_uuid(), 'BETONEIRA (SERVENTES)'),
(gen_random_uuid(), 'CARPINTARIA (CARPINTEIROS E AUXILIARES)'),
(gen_random_uuid(), 'CARPINTARIA (SERVENTES)'),
(gen_random_uuid(), 'ELÉTRICA (ELETRICISTAS E AUXILIARES)'),
(gen_random_uuid(), 'ELÉTRICA (SERVENTES)'),
(gen_random_uuid(), 'HIDRÁULICA (ENCANADORES E AUXILIARES)'),
(gen_random_uuid(), 'HIDRÁULICA (SERVENTES)'),
(gen_random_uuid(), 'IMPERMEABILIZAÇÃO (SERVENTES)'),
(gen_random_uuid(), 'LIMPEZA (AUXILIARES DE SERVIÇOS GERAIS E SERVENTESS)'),
(gen_random_uuid(), 'OP DE MÁQUINAS'),
(gen_random_uuid(), 'PINTURA (PINTORES E AUXILIARES)'),
(gen_random_uuid(), 'PINTURAS (SERVENTES)'),
(gen_random_uuid(), 'RESERVATÓRIO (PEDREIROS)'),
(gen_random_uuid(), 'RESERVATÓRIO (SERVENTES)'),
(gen_random_uuid(), 'SOLDAGEM (SERRALHEIROS, SOLDADORES E AUXILIARES)'),
(gen_random_uuid(), 'SOLDAGEM (SERVENTES)');

-- ============================================
-- 4. INSERIR EPIs POR FUNÇÃO
-- ============================================
-- interval_months: calculado como 1 / taxa_mensal (para cálculo de necessidade de efetivos)
-- quantity_per_employee: quantidade que cada funcionário projetado recebe

-- ADMINISTRATIVO
INSERT INTO funcao_epi_items (funcao_id, epi, interval_months, quantity_per_employee)
SELECT 
  f.id,
  epi_data.epi,
  epi_data.interval_months,
  epi_data.quantity_per_employee
FROM funcoes f
CROSS JOIN (VALUES
  ('BOTA DE ADMINISTRATIVO', 12, 1),
  ('CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)', 4, 1),
  ('PROTETOR SOLAR', 6.67, 1)
) AS epi_data(epi, interval_months, quantity_per_employee)
WHERE f.name = 'ADMINISTRATIVO';

-- ALVENARIA (PEDREIROS)
INSERT INTO funcao_epi_items (funcao_id, epi, interval_months, quantity_per_employee)
SELECT 
  f.id,
  epi_data.epi,
  epi_data.interval_months,
  epi_data.quantity_per_employee
FROM funcoes f
CROSS JOIN (VALUES
  ('BOTA DE COURO', 3, 1),
  ('CALÇA DA FARDA DA EMPRESA', 4, 2),
  ('CAMISA DA FARDA', 4, 2),
  ('CAPACETE (DETALHE VERMELHO)', 12, 1),
  ('CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)', 4, 1),
  ('LUVA LÁTEX - LARANJA REFORÇADA', 0.364, 4),
  ('LUVA VULCANIZADA', 0.4, 3),
  ('ÓCULOS DE PROTEÇÃO TRANSPARENTE', 1, 1),
  ('PROTETOR SOLAR', 6.67, 1)
) AS epi_data(epi, interval_months, quantity_per_employee)
WHERE f.name = 'ALVENARIA (PEDREIROS)';

-- ALVENARIA (SERVENTES)
INSERT INTO funcao_epi_items (funcao_id, epi, interval_months, quantity_per_employee)
SELECT 
  f.id,
  epi_data.epi,
  epi_data.interval_months,
  epi_data.quantity_per_employee
FROM funcoes f
CROSS JOIN (VALUES
  ('BOTA DE COURO', 3, 1),
  ('CALÇA DA FARDA DA EMPRESA', 4, 2),
  ('CAMISA DA FARDA', 4, 2),
  ('CAPACETE (DETALHE AMARELO)', 12, 1),
  ('CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)', 4, 1),
  ('LUVA LÁTEX - LARANJA REFORÇADA', 0.364, 4),
  ('LUVA VULCANIZADA', 0.4, 3),
  ('ÓCULOS DE PROTEÇÃO TRANSPARENTE', 1, 1),
  ('PROTETOR SOLAR', 6.67, 1)
) AS epi_data(epi, interval_months, quantity_per_employee)
WHERE f.name = 'ALVENARIA (SERVENTES)';

-- ALMOXARIFADO - CASA DE QUÍMICOS
INSERT INTO funcao_epi_items (funcao_id, epi, interval_months, quantity_per_employee)
SELECT 
  f.id,
  epi_data.epi,
  epi_data.interval_months,
  epi_data.quantity_per_employee
FROM funcoes f
CROSS JOIN (VALUES
  ('BOTA DE COURO', 3, 1),
  ('CALÇA DA FARDA DA EMPRESA', 4, 2),
  ('CAMISA DA FARDA', 4, 2),
  ('MÁSCARA DESCARTÁVEL', 0.1, 4),
  ('PROTETOR SOLAR', 6.67, 1)
) AS epi_data(epi, interval_months, quantity_per_employee)
WHERE f.name = 'ALMOXARIFADO - CASA DE QUÍMICOS (ALMOXARIFE E AUXILIAR DE ALMOXARIFE)';

-- ARMAÇÃO (ARMADORES E AUXILIARES)
INSERT INTO funcao_epi_items (funcao_id, epi, interval_months, quantity_per_employee)
SELECT 
  f.id,
  epi_data.epi,
  epi_data.interval_months,
  epi_data.quantity_per_employee
FROM funcoes f
CROSS JOIN (VALUES
  ('BOTA DE COURO', 3, 1),
  ('CALÇA DA FARDA DA EMPRESA', 4, 2),
  ('CAMISA DA FARDA', 4, 2),
  ('CAPACETE (DETALHE MARROM)', 12, 1),
  ('CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)', 4, 1),
  ('LUVA DE VAQUETA', 0.5, 1),
  ('MÁSCARA DESCARTÁVEL', 0.1, 4),
  ('ÓCULOS DE PROTEÇÃO TRANSPARENTE', 1, 1),
  ('PROTETOR AURICULAR TAPA OUVIDOS (PLUG)', 0.333, 1),
  ('PROTETOR SOLAR', 6.67, 1)
) AS epi_data(epi, interval_months, quantity_per_employee)
WHERE f.name = 'ARMAÇÃO (ARMADORES E AUXILIARES)';

-- ARMAÇÃO (SERVENTES)
INSERT INTO funcao_epi_items (funcao_id, epi, interval_months, quantity_per_employee)
SELECT 
  f.id,
  epi_data.epi,
  epi_data.interval_months,
  epi_data.quantity_per_employee
FROM funcoes f
CROSS JOIN (VALUES
  ('BOTA DE COURO', 3, 1),
  ('CALÇA DA FARDA DA EMPRESA', 4, 2),
  ('CAMISA DA FARDA', 4, 2),
  ('CAPACETE (DETALHE AMARELO)', 12, 1),
  ('CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)', 4, 1),
  ('LUVA DE POLIÉSTER COM BANHO DE LÁTEX CORRUGADO SS1009 - SUPER SAFFETY / CA - 31895', 0.333, 4),
  ('LUVA DE VAQUETA', 0.5, 1),
  ('MÁSCARA DESCARTÁVEL', 0.1, 4),
  ('ÓCULOS DE PROTEÇÃO TRANSPARENTE', 1, 1),
  ('PROTETOR AURICULAR TAPA OUVIDOS (PLUG)', 0.333, 1),
  ('PROTETOR SOLAR', 6.67, 1)
) AS epi_data(epi, interval_months, quantity_per_employee)
WHERE f.name = 'ARMAÇÃO (SERVENTES)';

-- BETONEIRA (OPERADORES DE BETONEIRA)
INSERT INTO funcao_epi_items (funcao_id, epi, interval_months, quantity_per_employee)
SELECT 
  f.id,
  epi_data.epi,
  epi_data.interval_months,
  epi_data.quantity_per_employee
FROM funcoes f
CROSS JOIN (VALUES
  ('BOTA DE COURO', 3, 1),
  ('CALÇA DA FARDA DA EMPRESA', 4, 2),
  ('CAMISA DA FARDA', 4, 2),
  ('CAPACETE (DETALHE VERMELHO)', 12, 1),
  ('CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)', 4, 1),
  ('LUVA LÁTEX - LARANJA REFORÇADA', 0.364, 4),
  ('MÁSCARA DESCARTÁVEL', 0.1, 4),
  ('ÓCULOS DE PROTEÇÃO TRANSPARENTE', 1, 1),
  ('PROTETOR SOLAR', 6.67, 1)
) AS epi_data(epi, interval_months, quantity_per_employee)
WHERE f.name = 'BETONEIRA (OPERADORES DE BETONEIRA)';

-- BETONEIRA (SERVENTES)
INSERT INTO funcao_epi_items (funcao_id, epi, interval_months, quantity_per_employee)
SELECT 
  f.id,
  epi_data.epi,
  epi_data.interval_months,
  epi_data.quantity_per_employee
FROM funcoes f
CROSS JOIN (VALUES
  ('ABAFADOR DE RUÍDO PARA ACOPLAR', 3, 1),
  ('AVENTAL DE RASPA', 3, 2),
  ('BOTA DE BORRACHA', 3, 1),
  ('BOTA DE COURO', 3, 1),
  ('CALÇA DA FARDA DA EMPRESA', 4, 2),
  ('CAMISA DA FARDA', 4, 2),
  ('CAPACETE (DETALHE AMARELO)', 12, 1),
  ('CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)', 4, 1),
  ('LUVA LÁTEX - LARANJA REFORÇADA', 0.364, 4),
  ('MÁSCARA DESCARTÁVEL', 0.1, 4),
  ('ÓCULOS DE PROTEÇÃO TRANSPARENTE', 1, 1),
  ('PROTETOR SOLAR', 6.67, 1)
) AS epi_data(epi, interval_months, quantity_per_employee)
WHERE f.name = 'BETONEIRA (SERVENTES)';

-- CARPINTARIA (CARPINTEIROS E AUXILIARES)
INSERT INTO funcao_epi_items (funcao_id, epi, interval_months, quantity_per_employee)
SELECT 
  f.id,
  epi_data.epi,
  epi_data.interval_months,
  epi_data.quantity_per_employee
FROM funcoes f
CROSS JOIN (VALUES
  ('ABAFADOR DE RUÍDO PARA ACOPLAR', 3, 1),
  ('BOTA DE COURO', 3, 1),
  ('CALÇA DA FARDA DA EMPRESA', 4, 2),
  ('CAMISA DA FARDA', 4, 2),
  ('CAPACETE (DETALHE VERDE)', 12, 1),
  ('CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)', 4, 1),
  ('LUVA DE POLIÉSTER COM BANHO DE LÁTEX CORRUGADO SS1009 - SUPER SAFFETY / CA - 31895', 0.333, 4),
  ('MÁSCARA DESCARTÁVEL', 0.1, 4),
  ('ÓCULOS DE PROTEÇÃO TRANSPARENTE', 1, 1),
  ('PROTETOR SOLAR', 6.67, 1)
) AS epi_data(epi, interval_months, quantity_per_employee)
WHERE f.name = 'CARPINTARIA (CARPINTEIROS E AUXILIARES)';

-- CARPINTARIA (SERVENTES)
INSERT INTO funcao_epi_items (funcao_id, epi, interval_months, quantity_per_employee)
SELECT 
  f.id,
  epi_data.epi,
  epi_data.interval_months,
  epi_data.quantity_per_employee
FROM funcoes f
CROSS JOIN (VALUES
  ('ABAFADOR DE RUÍDO PARA ACOPLAR', 3, 1),
  ('BOTA DE COURO', 3, 1),
  ('CALÇA DA FARDA DA EMPRESA', 4, 2),
  ('CAMISA DA FARDA', 4, 2),
  ('CAPACETE (DETALHE AMARELO)', 12, 1),
  ('CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)', 4, 1),
  ('LUVA DE POLIÉSTER COM BANHO DE LÁTEX CORRUGADO SS1009 - SUPER SAFFETY / CA - 31895', 0.333, 4),
  ('MÁSCARA DESCARTÁVEL', 0.1, 4),
  ('ÓCULOS DE PROTEÇÃO TRANSPARENTE', 1, 1),
  ('PROTETOR SOLAR', 6.67, 1)
) AS epi_data(epi, interval_months, quantity_per_employee)
WHERE f.name = 'CARPINTARIA (SERVENTES)';

-- ELÉTRICA (ELETRICISTAS E AUXILIARES)
INSERT INTO funcao_epi_items (funcao_id, epi, interval_months, quantity_per_employee)
SELECT 
  f.id,
  epi_data.epi,
  epi_data.interval_months,
  epi_data.quantity_per_employee
FROM funcoes f
CROSS JOIN (VALUES
  ('BOTA DE COURO', 3, 1),
  ('CALÇA DA FARDA DA EMPRESA', 4, 2),
  ('CAMISA DA FARDA', 4, 2),
  ('CAPACETE (DETALHE CINZA)', 12, 1),
  ('CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)', 4, 1),
  ('LUVA EM HELANCA PU', 0.25, 4),
  ('ÓCULOS DE PROTEÇÃO TRANSPARENTE', 1, 1),
  ('PROTETOR AURICULAR TAPA OUVIDOS (PLUG)', 0.333, 1),
  ('PROTETOR SOLAR', 6.67, 1)
) AS epi_data(epi, interval_months, quantity_per_employee)
WHERE f.name = 'ELÉTRICA (ELETRICISTAS E AUXILIARES)';

-- ELÉTRICA (SERVENTES)
INSERT INTO funcao_epi_items (funcao_id, epi, interval_months, quantity_per_employee)
SELECT 
  f.id,
  epi_data.epi,
  epi_data.interval_months,
  epi_data.quantity_per_employee
FROM funcoes f
CROSS JOIN (VALUES
  ('BOTA DE COURO', 3, 1),
  ('CALÇA DA FARDA DA EMPRESA', 4, 2),
  ('CAMISA DA FARDA', 4, 2),
  ('CAPACETE (DETALHE AMARELO)', 12, 1),
  ('CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)', 4, 1),
  ('LUVA EM HELANCA PU', 0.25, 4),
  ('ÓCULOS DE PROTEÇÃO TRANSPARENTE', 1, 1),
  ('PROTETOR AURICULAR TAPA OUVIDOS (PLUG)', 0.333, 1),
  ('PROTETOR SOLAR', 6.67, 1)
) AS epi_data(epi, interval_months, quantity_per_employee)
WHERE f.name = 'ELÉTRICA (SERVENTES)';

-- HIDRÁULICA (ENCANADORES E AUXILIARES)
INSERT INTO funcao_epi_items (funcao_id, epi, interval_months, quantity_per_employee)
SELECT 
  f.id,
  epi_data.epi,
  epi_data.interval_months,
  epi_data.quantity_per_employee
FROM funcoes f
CROSS JOIN (VALUES
  ('BOTA DE COURO', 3, 1),
  ('CALÇA DA FARDA DA EMPRESA', 4, 2),
  ('CAMISA DA FARDA', 4, 2),
  ('CAPACETE (DETALHE AZUL)', 12, 1),
  ('CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)', 4, 1),
  ('LUVA EM HELANCA PU', 0.25, 4),
  ('LUVA LÁTEX - LARANJA REFORÇADA', 0.364, 4),
  ('MÁSCARA DESCARTÁVEL', 0.1, 4),
  ('ÓCULOS DE PROTEÇÃO TRANSPARENTE', 1, 1),
  ('PROTETOR SOLAR', 6.67, 1)
) AS epi_data(epi, interval_months, quantity_per_employee)
WHERE f.name = 'HIDRÁULICA (ENCANADORES E AUXILIARES)';

-- HIDRÁULICA (SERVENTES)
INSERT INTO funcao_epi_items (funcao_id, epi, interval_months, quantity_per_employee)
SELECT 
  f.id,
  epi_data.epi,
  epi_data.interval_months,
  epi_data.quantity_per_employee
FROM funcoes f
CROSS JOIN (VALUES
  ('BOTA DE COURO', 3, 1),
  ('CALÇA DA FARDA DA EMPRESA', 4, 2),
  ('CAMISA DA FARDA', 4, 2),
  ('CAPACETE (DETALHE AMARELO)', 12, 1),
  ('CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)', 4, 1),
  ('LUVA EM HELANCA PU', 0.25, 4),
  ('LUVA LÁTEX - LARANJA REFORÇADA', 0.364, 4),
  ('MÁSCARA DESCARTÁVEL', 0.1, 4),
  ('ÓCULOS DE PROTEÇÃO TRANSPARENTE', 1, 1),
  ('PROTETOR SOLAR', 6.67, 1)
) AS epi_data(epi, interval_months, quantity_per_employee)
WHERE f.name = 'HIDRÁULICA (SERVENTES)';

-- IMPERMEABILIZAÇÃO (SERVENTES)
INSERT INTO funcao_epi_items (funcao_id, epi, interval_months, quantity_per_employee)
SELECT 
  f.id,
  epi_data.epi,
  epi_data.interval_months,
  epi_data.quantity_per_employee
FROM funcoes f
CROSS JOIN (VALUES
  ('BOTA DE COURO', 3, 1),
  ('CALÇA DA FARDA DA EMPRESA', 4, 2),
  ('CAMISA DA FARDA', 4, 2),
  ('CAPACETE (DETALHE AMARELO)', 12, 1),
  ('CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)', 4, 1),
  ('LUVA LÁTEX - LARANJA REFORÇADA', 0.364, 4),
  ('MACACÃO DE PROTEÇÃO AZUL', 0.5, 1),
  ('MÁSCARA DESCARTÁVEL', 0.1, 4),
  ('ÓCULOS DE PROTEÇÃO TRANSPARENTE', 1, 1),
  ('PROTETOR AURICULAR TAPA OUVIDOS (PLUG)', 0.333, 1),
  ('PROTETOR SOLAR', 6.67, 1)
) AS epi_data(epi, interval_months, quantity_per_employee)
WHERE f.name = 'IMPERMEABILIZAÇÃO (SERVENTES)';

-- LIMPEZA (AUXILIARES DE SERVIÇOS GERAIS E SERVENTESS)
INSERT INTO funcao_epi_items (funcao_id, epi, interval_months, quantity_per_employee)
SELECT 
  f.id,
  epi_data.epi,
  epi_data.interval_months,
  epi_data.quantity_per_employee
FROM funcoes f
CROSS JOIN (VALUES
  ('CALÇA DA FARDA DA EMPRESA', 4, 2),
  ('CAMISA DA FARDA', 4, 2),
  ('CAPACETE (DETALHE AMARELO)', 12, 1),
  ('CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)', 4, 1),
  ('LUVA LÁTEX - LARANJA REFORÇADA', 0.364, 4),
  ('MÁSCARA DESCARTÁVEL', 0.1, 4),
  ('PROTETOR SOLAR', 6.67, 1)
) AS epi_data(epi, interval_months, quantity_per_employee)
WHERE f.name = 'LIMPEZA (AUXILIARES DE SERVIÇOS GERAIS E SERVENTESS)';

-- OP DE MÁQUINAS
INSERT INTO funcao_epi_items (funcao_id, epi, interval_months, quantity_per_employee)
SELECT 
  f.id,
  epi_data.epi,
  epi_data.interval_months,
  epi_data.quantity_per_employee
FROM funcoes f
CROSS JOIN (VALUES
  ('BOTA DE COURO', 3, 1),
  ('CALÇA DA FARDA DA EMPRESA', 4, 2),
  ('CAMISA DA FARDA', 4, 2),
  ('CAPACETE (DETALHE VERMELHO)', 12, 1),
  ('PROTETOR AURICULAR TIPO CONCHA', 1, 1),
  ('PROTETOR SOLAR', 6.67, 1)
) AS epi_data(epi, interval_months, quantity_per_employee)
WHERE f.name = 'OP DE MÁQUINAS';

-- PINTURA (PINTORES E AUXILIARES)
INSERT INTO funcao_epi_items (funcao_id, epi, interval_months, quantity_per_employee)
SELECT 
  f.id,
  epi_data.epi,
  epi_data.interval_months,
  epi_data.quantity_per_employee
FROM funcoes f
CROSS JOIN (VALUES
  ('BOTA DE COURO', 3, 1),
  ('CALÇA DA FARDA DA EMPRESA', 4, 2),
  ('CAMISA DA FARDA', 4, 2),
  ('CAPACETE (DETALHE VERMELHO)', 12, 1),
  ('CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)', 4, 1),
  ('LUVA EM HELANCA PU', 0.25, 4),
  ('LUVA LÁTEX - LARANJA REFORÇADA', 0.364, 4),
  ('MÁSCARA DESCARTÁVEL', 0.1, 4),
  ('ÓCULOS DE PROTEÇÃO TRANSPARENTE', 1, 1),
  ('PROTETOR SOLAR', 6.67, 1)
) AS epi_data(epi, interval_months, quantity_per_employee)
WHERE f.name = 'PINTURA (PINTORES E AUXILIARES)';

-- PINTURAS (SERVENTES)
INSERT INTO funcao_epi_items (funcao_id, epi, interval_months, quantity_per_employee)
SELECT 
  f.id,
  epi_data.epi,
  epi_data.interval_months,
  epi_data.quantity_per_employee
FROM funcoes f
CROSS JOIN (VALUES
  ('BOTA DE COURO', 3, 1),
  ('CALÇA DA FARDA DA EMPRESA', 4, 2),
  ('CAMISA DA FARDA', 4, 2),
  ('CAPACETE (DETALHE AMARELO)', 12, 1),
  ('CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)', 4, 1),
  ('LUVA EM HELANCA PU', 0.25, 4),
  ('LUVA LÁTEX - LARANJA REFORÇADA', 0.364, 4),
  ('MÁSCARA DESCARTÁVEL', 0.1, 4),
  ('ÓCULOS DE PROTEÇÃO TRANSPARENTE', 1, 1),
  ('PROTETOR SOLAR', 6.67, 1)
) AS epi_data(epi, interval_months, quantity_per_employee)
WHERE f.name = 'PINTURAS (SERVENTES)';

-- RESERVATÓRIO (PEDREIROS)
INSERT INTO funcao_epi_items (funcao_id, epi, interval_months, quantity_per_employee)
SELECT 
  f.id,
  epi_data.epi,
  epi_data.interval_months,
  epi_data.quantity_per_employee
FROM funcoes f
CROSS JOIN (VALUES
  ('BOTA DE COURO', 3, 1),
  ('CALÇA DA FARDA DA EMPRESA', 4, 2),
  ('CAMISA DA FARDA', 4, 2),
  ('CAPACETE (DETALHE VERMELHO)', 12, 1),
  ('CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)', 4, 1),
  ('LUVA LÁTEX - LARANJA REFORÇADA', 0.364, 4),
  ('LUVA VULCANIZADA', 0.4, 3),
  ('ÓCULOS DE PROTEÇÃO TRANSPARENTE', 1, 1),
  ('PROTETOR AURICULAR TAPA OUVIDOS (PLUG)', 0.333, 1),
  ('PROTETOR SOLAR', 6.67, 1)
) AS epi_data(epi, interval_months, quantity_per_employee)
WHERE f.name = 'RESERVATÓRIO (PEDREIROS)';

-- RESERVATÓRIO (SERVENTES)
INSERT INTO funcao_epi_items (funcao_id, epi, interval_months, quantity_per_employee)
SELECT 
  f.id,
  epi_data.epi,
  epi_data.interval_months,
  epi_data.quantity_per_employee
FROM funcoes f
CROSS JOIN (VALUES
  ('BOTA DE COURO', 3, 1),
  ('CALÇA DA FARDA DA EMPRESA', 4, 2),
  ('CAMISA DA FARDA', 4, 2),
  ('CAPACETE (DETALHE AMARELO)', 12, 1),
  ('CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)', 4, 1),
  ('RESPIRADOR FACIAL 1/4  COM FILTRO', 3, 1),
  ('LUVA LÁTEX - LARANJA REFORÇADA', 0.364, 4),
  ('LUVA VULCANIZADA', 0.4, 3),
  ('ÓCULOS DE PROTEÇÃO ESCURO', 1, 1),
  ('PROTETOR AURICULAR TAPA OUVIDOS (PLUG)', 0.333, 1),
  ('PROTETOR SOLAR', 6.67, 1)
) AS epi_data(epi, interval_months, quantity_per_employee)
WHERE f.name = 'RESERVATÓRIO (SERVENTES)';

-- SOLDAGEM (SERRALHEIROS, SOLDADORES E AUXILIARES)
INSERT INTO funcao_epi_items (funcao_id, epi, interval_months, quantity_per_employee)
SELECT 
  f.id,
  epi_data.epi,
  epi_data.interval_months,
  epi_data.quantity_per_employee
FROM funcoes f
CROSS JOIN (VALUES
  ('BOTA DE COURO', 3, 1),
  ('CALÇA DA FARDA DA EMPRESA', 4, 2),
  ('CAMISA DA FARDA', 4, 2),
  ('CAPACETE (DETALHE MARROM)', 12, 1),
  ('CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)', 4, 1),
  ('FARDAMENTO ANTI-CHAMAS (AVENTAL COM MANGAS) - C.A. 35236', 12, 2),
  ('LUVA DE VAQUETA', 0.5, 1),
  ('LUVA EM HELANCA PU', 0.25, 4),
  ('MASCARA SOLDA AUTOMÁTICA S/ REGULAGEM 3 A 11 V8', 1, 1),
  ('PROTETOR AURICULAR TAPA OUVIDOS (PLUG)', 0.333, 1),
  ('PROTETOR SOLAR', 6.67, 1)
) AS epi_data(epi, interval_months, quantity_per_employee)
WHERE f.name = 'SOLDAGEM (SERRALHEIROS, SOLDADORES E AUXILIARES)';

-- SOLDAGEM (SERVENTES)
INSERT INTO funcao_epi_items (funcao_id, epi, interval_months, quantity_per_employee)
SELECT 
  f.id,
  epi_data.epi,
  epi_data.interval_months,
  epi_data.quantity_per_employee
FROM funcoes f
CROSS JOIN (VALUES
  ('AVENTAL DE RASPA', 3, 2),
  ('BOTA DE COURO', 3, 1),
  ('CALÇA DA FARDA DA EMPRESA', 4, 2),
  ('CAMISA DA FARDA', 4, 2),
  ('CAPACETE (DETALHE AMARELO)', 12, 1),
  ('CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)', 4, 1),
  ('FARDAMENTO ANTI-CHAMAS (AVENTAL COM MANGAS) - C.A. 35236', 12, 2),
  ('LUVA DE VAQUETA', 0.5, 1),
  ('LUVA EM HELANCA PU', 0.25, 4),
  ('MASCARA SOLDA AUTOMÁTICA S/ REGULAGEM 3 A 11 V8', 1, 1),
  ('PROTETOR AURICULAR TAPA OUVIDOS (PLUG)', 0.333, 1),
  ('PROTETOR SOLAR', 6.67, 1)
) AS epi_data(epi, interval_months, quantity_per_employee)
WHERE f.name = 'SOLDAGEM (SERVENTES)';

-- ============================================
-- 5. INSERIR OBRAS DE EXEMPLO
-- ============================================
INSERT INTO obras (id, name) VALUES
(gen_random_uuid(), 'Obra Centro Comercial'),
(gen_random_uuid(), 'Obra Residencial Norte'),
(gen_random_uuid(), 'Obra Industrial Sul');

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- Verificar dados inseridos
SELECT 'EPIs cadastrados:' as info, COUNT(*) as total FROM epi_items
UNION ALL
SELECT 'Funções cadastradas:', COUNT(*) FROM funcoes
UNION ALL
SELECT 'Relações Função-EPI:', COUNT(*) FROM funcao_epi_items
UNION ALL
SELECT 'Obras cadastradas:', COUNT(*) FROM obras;
