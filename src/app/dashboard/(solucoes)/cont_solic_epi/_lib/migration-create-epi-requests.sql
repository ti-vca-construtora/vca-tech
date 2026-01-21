-- ============================================
-- MIGRATION - Criar tabela epi_requests
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Criar tabela epi_requests para armazenar histórico de solicitações
CREATE TABLE IF NOT EXISTS epi_requests (
  id TEXT PRIMARY KEY,
  obra_id TEXT NOT NULL,
  obra_name TEXT NOT NULL,
  obra_type TEXT NOT NULL,
  
  -- Dados coletados manualmente nas etapas 1-3
  collected_data JSONB NOT NULL,
  
  -- Dados calculados (resultado da etapa 4)
  request_data JSONB NOT NULL,
  total_summary JSONB NOT NULL,
  
  -- Informações de criação
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by_id TEXT,
  created_by_name TEXT,
  
  -- Status da solicitação
  status TEXT NOT NULL DEFAULT 'PENDING',
  
  -- Auditoria
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_epi_requests_obra_id ON epi_requests(obra_id);
CREATE INDEX IF NOT EXISTS idx_epi_requests_status ON epi_requests(status);
CREATE INDEX IF NOT EXISTS idx_epi_requests_created_at ON epi_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_epi_requests_created_by_id ON epi_requests(created_by_id);

-- Adicionar comentários para documentação
COMMENT ON TABLE epi_requests IS 'Histórico de solicitações de EPIs';
COMMENT ON COLUMN epi_requests.id IS 'ID único da solicitação';
COMMENT ON COLUMN epi_requests.obra_id IS 'ID da obra relacionada';
COMMENT ON COLUMN epi_requests.obra_name IS 'Nome da obra (denormalizado para relatórios)';
COMMENT ON COLUMN epi_requests.obra_type IS 'Tipo de obra: INCORPORACAO ou LOTEAMENTO';
COMMENT ON COLUMN epi_requests.collected_data IS 'Dados coletados manualmente: epiCounts, currentFunctionCounts, projectedFunctionCounts';
COMMENT ON COLUMN epi_requests.request_data IS 'Detalhamento por função: functionRequests array com cálculos';
COMMENT ON COLUMN epi_requests.total_summary IS 'Resumo consolidado: total por EPI';
COMMENT ON COLUMN epi_requests.status IS 'Status: PENDING, APPROVED, REJECTED, COMPLETED';
COMMENT ON COLUMN epi_requests.created_by_id IS 'ID do usuário que criou';
COMMENT ON COLUMN epi_requests.created_by_name IS 'Nome do usuário (denormalizado)';

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_epi_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_epi_requests_updated_at
  BEFORE UPDATE ON epi_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_epi_requests_updated_at();

-- ============================================
-- Verificar migração
-- ============================================
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'epi_requests'
ORDER BY ordinal_position;

SELECT 'Tabela epi_requests criada com sucesso!' as status;
