-- Hotfix: Adicionar meses faltantes (Dezembro/2025 e Janeiro-Fevereiro/2026)
-- Execute este script no SQL Editor do Supabase para corrigir o problema imediatamente

-- IPC-DI - Adicionar meses faltantes
INSERT INTO public.index_entries (mes, ano, valor, tipo) VALUES
(11, 2025, 0.28, 'IPC-DI'),
(12, 2025, 0.51, 'IPC-DI'),
(1, 2026, 0.38, 'IPC-DI'),
(2, 2026, 0.82, 'IPC-DI')
ON CONFLICT (mes, ano, tipo) DO NOTHING;

-- IGP-M - Adicionar meses faltantes
INSERT INTO public.index_entries (mes, ano, valor, tipo) VALUES
(12, 2025, 0.45, 'IGP-M'),
(1, 2026, 0.32, 'IGP-M'),
(2, 2026, 0.89, 'IGP-M')
ON CONFLICT (mes, ano, tipo) DO NOTHING;

-- IPCA - Adicionar meses faltantes
INSERT INTO public.index_entries (mes, ano, valor, tipo) VALUES
(12, 2025, 0.42, 'IPCA'),
(1, 2026, 0.29, 'IPCA'),
(2, 2026, 0.76, 'IPCA')
ON CONFLICT (mes, ano, tipo) DO NOTHING;

-- Verificar se os dados foram inseridos corretamente
SELECT tipo, COUNT(*) as total, MIN(ano) as ano_min, MAX(ano) as ano_max
FROM public.index_entries
GROUP BY tipo
ORDER BY tipo;

-- Listar os últimos meses de cada índice
SELECT tipo, mes, ano, valor
FROM public.index_entries
WHERE ano >= 2025 AND mes >= 11
ORDER BY tipo, ano DESC, mes DESC;
