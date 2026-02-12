import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Cliente Supabase específico para a solução de EPIs
const supabaseEpiUrl = process.env.NEXT_PUBLIC_SUPABASE_EPI_URL || '';
const supabaseEpiAnonKey = process.env.NEXT_PUBLIC_SUPABASE_EPI_ANON_KEY || '';

if (!supabaseEpiUrl || !supabaseEpiAnonKey) {
  console.warn(
    'Supabase EPI credentials not found. Please add NEXT_PUBLIC_SUPABASE_EPI_URL and NEXT_PUBLIC_SUPABASE_EPI_ANON_KEY to .env file'
  );
}

export const supabaseEpi = createSupabaseClient<Database>(supabaseEpiUrl, supabaseEpiAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Função para criar nova instância do cliente (para compatibilidade)
export function createClient(): SupabaseClient<Database> {
  return supabaseEpi;
}
