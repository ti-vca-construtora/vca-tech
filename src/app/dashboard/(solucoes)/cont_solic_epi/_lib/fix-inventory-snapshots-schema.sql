-- ============================================
-- Script para corrigir o schema da tabela inventory_snapshots
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Deletar a tabela antiga (cuidado: isso apaga todos os dados!)
DROP TABLE IF EXISTS inventory_snapshots CASCADE;

-- 2. Criar a nova tabela com o schema correto (usando TEXT para IDs)
CREATE TABLE inventory_snapshots (
  id TEXT PRIMARY KEY,
  obra_id TEXT NOT NULL,
  obra_name TEXT NOT NULL,
  obra_state TEXT NOT NULL,
  obra_city TEXT NOT NULL,
  obra_type TEXT NOT NULL CHECK (obra_type IN ('INCORPORADORA', 'LOTEAMENTO')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by_id TEXT,
  created_by_name TEXT,
  created_by_email TEXT,
  epi_counts JSONB NOT NULL DEFAULT '{}'::jsonb,
  function_counts JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 3. Criar índices para melhorar performance
CREATE INDEX idx_inventory_snapshots_obra_id ON inventory_snapshots(obra_id);
CREATE INDEX idx_inventory_snapshots_created_at ON inventory_snapshots(created_at DESC);

-- 4. Habilitar RLS (Row Level Security) se necessário
ALTER TABLE inventory_snapshots ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas de acesso (ajuste conforme sua necessidade)
-- Exemplo: permitir leitura e escrita para usuários autenticados
CREATE POLICY "Permitir leitura para todos autenticados" 
  ON inventory_snapshots FOR SELECT 
  USING (true);

CREATE POLICY "Permitir inserção para todos autenticados" 
  ON inventory_snapshots FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Permitir atualização para todos autenticados" 
  ON inventory_snapshots FOR UPDATE 
  USING (true);

CREATE POLICY "Permitir deleção para todos autenticados" 
  ON inventory_snapshots FOR DELETE 
  USING (true);

-- ============================================
-- Pronto! Agora a tabela está com o schema correto
-- ============================================
