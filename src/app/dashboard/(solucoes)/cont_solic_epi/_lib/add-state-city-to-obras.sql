-- ============================================
-- Script para adicionar campos à tabela obras
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Adicionar os campos state, city e empreendimento_type à tabela obras
ALTER TABLE obras ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE obras ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE obras ADD COLUMN IF NOT EXISTS empreendimento_type TEXT DEFAULT 'INCORPORADORA' CHECK (empreendimento_type IN ('INCORPORADORA', 'LOTEAMENTO'));

-- Se você já tiver dados nas obras, atualize com valores padrão
-- UPDATE obras SET state = 'SP', city = 'São Paulo', empreendimento_type = 'INCORPORADORA' WHERE state IS NULL;

-- ============================================
-- Pronto! Os campos foram adicionados
-- ============================================
