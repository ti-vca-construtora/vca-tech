-- ============================================
-- SEED DATA - Controle e Solicitação de EPIs
-- Execute este script no SQL Editor do Supabase após criar as tabelas
-- ============================================
-- 
-- NOTA: interval_months é calculado como 1 / taxa_mensal_efetivos
-- Exemplo: taxa 0.333333 (1/3) = interval_months 3
--          taxa 10 (10 por mês) = interval_months 0.1

-- Limpar dados existentes (cuidado em produção!)
DELETE FROM funcao_epi_items;
DELETE FROM funcoes;
DELETE FROM epi_items;
DELETE FROM obras;

-- ============================================
-- 1. INSERIR EPIs
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
-- 2. INSERIR FUNÇÕES
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
-- 3. INSERIR EPIs POR FUNÇÃO
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
  ('BOTA DE ADMINISTRATIVO', 12, 1),              -- taxa 0.083333 = 1/12 meses
  ('CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)', 4, 1),  -- taxa 0.25 = 1/4 meses
  ('PROTETOR SOLAR', 6.67, 1)                     -- taxa 0.15 ≈ 1/6.67 meses
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
  ('BOTA DE COURO', 3, 1),                        -- taxa 0.333333 = 1/3 meses
  ('CALÇA DA FARDA DA EMPRESA', 4, 2),            -- taxa 0.25 = 1/4 meses
  ('CAMISA DA FARDA', 4, 2),                      -- taxa 0.25 = 1/4 meses
  ('CAPACETE (DETALHE VERMELHO)', 12, 1),         -- taxa 0.083333 = 1/12 meses
  ('CHAPÉU PESCADOR COM PROTEÇÃO DE OMBRO (TOUCA ÁRABE)', 4, 1),
  ('LUVA LÁTEX - LARANJA REFORÇADA', 0.364, 4),   -- taxa 2.75 ≈ 1/0.364 meses
  ('LUVA VULCANIZADA', 0.4, 3),                   -- taxa 2.5 = 1/0.4 meses
  ('ÓCULOS DE PROTEÇÃO TRANSPARENTE', 1, 1),      -- taxa 1 = 1/1 mês
  ('PROTETOR SOLAR', 6.67, 1)                     -- taxa 0.15 ≈ 1/6.67 meses
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
  ('MÁSCARA DESCARTÁVEL', 0.1, 4),                -- taxa 10 = 1/0.1 meses (10 por mês!)
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
  ('LUVA DE VAQUETA', 0.5, 1),                    -- taxa 2 = 1/0.5 meses
  ('MÁSCARA DESCARTÁVEL', 0.1, 4),
  ('ÓCULOS DE PROTEÇÃO TRANSPARENTE', 1, 1),
  ('PROTETOR AURICULAR TAPA OUVIDOS (PLUG)', 0.333, 1), -- taxa 3 = 1/0.333 meses
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
  ('LUVA DE POLIÉSTER COM BANHO DE LÁTEX CORRUGADO SS1009 - SUPER SAFFETY / CA - 31895', 0.333, 4), -- taxa 3
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
  ('ABAFADOR DE RUÍDO PARA ACOPLAR', 3, 1),       -- taxa 0.333333
  ('AVENTAL DE RASPA', 3, 2),                     -- taxa 0.333333
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
  ('LUVA EM HELANCA PU', 0.25, 4),                -- taxa 4 = 1/0.25 meses
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
  ('MACACÃO DE PROTEÇÃO AZUL', 0.5, 1),           -- taxa 2 = 1/0.5 meses
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
  ('PROTETOR AURICULAR TIPO CONCHA', 1, 1),       -- taxa 1 = 1/1 mês
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
  ('RESPIRADOR FACIAL 1/4  COM FILTRO', 3, 1),     -- taxa 0.333333
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
-- 4. INSERIR OBRAS DE EXEMPLO
-- ============================================
INSERT INTO obras (id, name) VALUES
(gen_random_uuid(), 'Obra Centro Comercial'),
(gen_random_uuid(), 'Obra Residencial Norte'),
(gen_random_uuid(), 'Obra Industrial Sul');

-- ============================================
-- FIM DO SEED
-- ============================================

-- Verificar dados inseridos
SELECT 'EPIs cadastrados:' as info, COUNT(*) as total FROM epi_items
UNION ALL
SELECT 'Funções cadastradas:', COUNT(*) FROM funcoes
UNION ALL
SELECT 'Relações Função-EPI:', COUNT(*) FROM funcao_epi_items
UNION ALL
SELECT 'Obras cadastradas:', COUNT(*) FROM obras;
