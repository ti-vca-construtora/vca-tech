-- Script para limpar duplicatas da tb_dac_config
-- Execução: Cole este script no SQL Editor do Supabase e execute

-- 1. Remover duplicatas (manter apenas o registro mais antigo)
DO $$
DECLARE
  oldest_config_id UUID;
BEGIN
  -- Pegar o ID do registro mais antigo
  SELECT id INTO oldest_config_id
  FROM public.tb_dac_config
  ORDER BY created_at ASC
  LIMIT 1;
  
  -- Mostrar quantos registros serão deletados
  RAISE NOTICE 'Registro mais antigo: %', oldest_config_id;
  RAISE NOTICE 'Total de registros antes: %', (SELECT COUNT(*) FROM public.tb_dac_config);
  
  -- Deletar todos os outros registros
  IF oldest_config_id IS NOT NULL THEN
    DELETE FROM public.tb_dac_config
    WHERE id != oldest_config_id;
  END IF;
  
  RAISE NOTICE 'Total de registros depois: %', (SELECT COUNT(*) FROM public.tb_dac_config);
END $$;

-- 2. Adicionar coluna singleton_guard se não existir
ALTER TABLE public.tb_dac_config 
  ADD COLUMN IF NOT EXISTS singleton_guard INTEGER DEFAULT 1;

-- 3. Atualizar o registro existente para ter singleton_guard = 1
UPDATE public.tb_dac_config 
SET singleton_guard = 1 
WHERE singleton_guard IS NULL;

-- 4. Criar índice único para prevenir duplicatas futuras
DROP INDEX IF EXISTS idx_tb_dac_config_singleton;
CREATE UNIQUE INDEX idx_tb_dac_config_singleton ON public.tb_dac_config(singleton_guard);

-- 5. Garantir que existe pelo menos 1 registro
INSERT INTO public.tb_dac_config (intervalo_dias, singleton_guard)
VALUES (30, 1)
ON CONFLICT (singleton_guard) DO NOTHING;

-- 6. Verificar resultado final
SELECT 
  id,
  intervalo_dias,
  created_at,
  updated_at,
  singleton_guard
FROM public.tb_dac_config;

-- Pronto! Agora deveria existir apenas 1 registro na tb_dac_config
