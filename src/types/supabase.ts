export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      epi_items: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      obras: {
        Row: {
          id: string
          name: string
          state: string
          city: string
          empreendimento_type: 'INCORPORADORA' | 'LOTEAMENTO'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          state: string
          city: string
          empreendimento_type: 'INCORPORADORA' | 'LOTEAMENTO'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          state?: string
          city?: string
          empreendimento_type?: 'INCORPORADORA' | 'LOTEAMENTO'
          created_at?: string
          updated_at?: string
        }
      }
      funcoes: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      funcao_epi_items: {
        Row: {
          id: string
          funcao_id: string
          epi: string
          interval_value: number
          interval_unit: 'DIA' | 'SEMANA' | 'MES' | 'ANO'
          projected_quantity: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          funcao_id: string
          epi: string
          interval_value: number
          interval_unit: 'DIA' | 'SEMANA' | 'MES' | 'ANO'
          projected_quantity?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          funcao_id?: string
          epi?: string
          interval_value?: number
          interval_unit?: 'DIA' | 'SEMANA' | 'MES' | 'ANO'
          projected_quantity?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      inventory_snapshots: {
        Row: {
          id: string
          obra_id: string
          obra_name: string
          obra_state: string
          obra_city: string
          obra_type: 'INCORPORADORA' | 'LOTEAMENTO'
          created_at: string
          created_by_id: string | null
          created_by_name: string | null
          created_by_email: string | null
          epi_counts: Json
          function_counts: Json
        }
        Insert: {
          id?: string
          obra_id: string
          obra_name: string
          obra_state: string
          obra_city: string
          obra_type: 'INCORPORADORA' | 'LOTEAMENTO'
          created_at?: string
          created_by_id?: string | null
          created_by_name?: string | null
          created_by_email?: string | null
          epi_counts: Json
          function_counts: Json
        }
        Update: {
          id?: string
          obra_id?: string
          obra_name?: string
          obra_state?: string
          obra_city?: string
          obra_type?: 'INCORPORADORA' | 'LOTEAMENTO'
          created_at?: string
          created_by_id?: string | null
          created_by_name?: string | null
          created_by_email?: string | null
          epi_counts?: Json
          function_counts?: Json
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
