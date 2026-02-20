-- Migration: Add company_id foreign key to tb_dac and tb_rps
-- Description: Links DAC and RPS records to tb_empresas table
-- Date: 2026-02-19
-- Note: Keeps existing nome_empresa/cnpj_empresa fields for backward compatibility

-- Add company_id column to tb_dac
ALTER TABLE tb_dac 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES tb_empresas(id) ON DELETE SET NULL;

-- Add company_id column to tb_rps
ALTER TABLE tb_rps 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES tb_empresas(id) ON DELETE SET NULL;

-- Add nome_empresa and cnpj_empresa to tb_rps (new fields for RPS)
ALTER TABLE tb_rps 
ADD COLUMN IF NOT EXISTS nome_empresa VARCHAR(255),
ADD COLUMN IF NOT EXISTS cnpj_empresa VARCHAR(20);

-- Create indexes for performance on foreign keys
CREATE INDEX IF NOT EXISTS idx_tb_dac_company_id ON tb_dac(company_id);
CREATE INDEX IF NOT EXISTS idx_tb_rps_company_id ON tb_rps(company_id);
CREATE INDEX IF NOT EXISTS idx_tb_rps_cnpj_empresa ON tb_rps(cnpj_empresa);

-- Verify changes
SELECT 
  'tb_dac' as table_name,
  COUNT(*) FILTER (WHERE company_id IS NOT NULL) as records_with_company,
  COUNT(*) as total_records
FROM tb_dac
UNION ALL
SELECT 
  'tb_rps' as table_name,
  COUNT(*) FILTER (WHERE company_id IS NOT NULL) as records_with_company,
  COUNT(*) as total_records
FROM tb_rps;
