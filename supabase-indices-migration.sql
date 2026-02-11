-- Create table for index entries (IPC-DI, IGP-M, IPCA)
CREATE TABLE IF NOT EXISTS public.index_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano INTEGER NOT NULL CHECK (ano >= 2000),
  valor DECIMAL(10, 2) NOT NULL,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('IPC-DI', 'IGP-M', 'IPCA')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(mes, ano, tipo)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_index_entries_tipo ON public.index_entries(tipo);
CREATE INDEX IF NOT EXISTS idx_index_entries_ano_mes ON public.index_entries(ano DESC, mes DESC);

-- Enable Row Level Security
ALTER TABLE public.index_entries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict this based on your needs)
CREATE POLICY "Allow all operations for authenticated users" ON public.index_entries
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.index_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Comment on table
COMMENT ON TABLE public.index_entries IS 'Stores monthly index rates for IPC-DI, IGP-M, and IPCA';

-- Create table for parcelas a desconsiderar
CREATE TABLE IF NOT EXISTS public.parcelas_desconsiderar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  descricao VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_parcelas_desconsiderar_descricao ON public.parcelas_desconsiderar(descricao);

-- Enable Row Level Security
ALTER TABLE public.parcelas_desconsiderar ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations for parcelas_desconsiderar" ON public.parcelas_desconsiderar
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger for parcelas_desconsiderar
CREATE TRIGGER set_updated_at_parcelas
  BEFORE UPDATE ON public.parcelas_desconsiderar
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Comment on table
COMMENT ON TABLE public.parcelas_desconsiderar IS 'Stores installment types that should be excluded from correction calculations';
