-- ============================================
-- MIGRATION - Adicionar suporte a tipos de empreendimento
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Criar ENUM para tipos de empreendimento
DO $$ BEGIN
  CREATE TYPE empreendimento_tipo AS ENUM ('INCORPORACAO', 'LOTEAMENTO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Adicionar coluna empreendimento_tipo na tabela funcao_epi_items
ALTER TABLE funcao_epi_items 
ADD COLUMN IF NOT EXISTS empreendimento_tipo empreendimento_tipo NOT NULL DEFAULT 'INCORPORACAO';

-- 3. Remover constraint UNIQUE antiga e criar nova incluindo empreendimento_tipo
ALTER TABLE funcao_epi_items 
DROP CONSTRAINT IF EXISTS funcao_epi_items_funcao_id_epi_key;

ALTER TABLE funcao_epi_items 
ADD CONSTRAINT funcao_epi_items_funcao_id_epi_tipo_key 
UNIQUE(funcao_id, epi, empreendimento_tipo);

-- 4. Duplicar registros existentes para LOTEAMENTO
-- (Os registros atuais serão mantidos como INCORPORACAO)
INSERT INTO funcao_epi_items (funcao_id, epi, interval_months, quantity_per_employee, empreendimento_tipo)
SELECT 
  funcao_id, 
  epi, 
  interval_months, 
  quantity_per_employee, 
  'LOTEAMENTO'::empreendimento_tipo
FROM funcao_epi_items
WHERE empreendimento_tipo = 'INCORPORACAO'
ON CONFLICT (funcao_id, epi, empreendimento_tipo) DO NOTHING;

-- 5. Adicionar coluna empreendimento_tipo na tabela obras
ALTER TABLE obras 
ADD COLUMN IF NOT EXISTS empreendimento_tipo empreendimento_tipo NOT NULL DEFAULT 'INCORPORACAO';

-- 6. Criar índice para melhorar performance de queries por tipo
CREATE INDEX IF NOT EXISTS idx_funcao_epi_items_tipo ON funcao_epi_items(empreendimento_tipo);
CREATE INDEX IF NOT EXISTS idx_obras_tipo ON obras(empreendimento_tipo);

-- ============================================
-- Verificar migração
-- ============================================
SELECT 
  empreendimento_tipo,
  COUNT(*) as total_configuracoes
FROM funcao_epi_items
GROUP BY empreendimento_tipo
ORDER BY empreendimento_tipo;

SELECT 
  'Configurações por tipo criadas com sucesso!' as status;
