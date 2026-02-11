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
          empreendimento_type: 'INCORPORACAO' | 'LOTEAMENTO'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          state: string
          city: string
          empreendimento_type: 'INCORPORACAO' | 'LOTEAMENTO'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          state?: string
          city?: string
          empreendimento_type?: 'INCORPORACAO' | 'LOTEAMENTO'
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
          obra_type: 'INCORPORACAO' | 'LOTEAMENTO'
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
          obra_type: 'INCORPORACAO' | 'LOTEAMENTO'
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
          obra_type?: 'INCORPORACAO' | 'LOTEAMENTO'
          created_at?: string
          created_by_id?: string | null
          created_by_name?: string | null
          created_by_email?: string | null
          epi_counts?: Json
          function_counts?: Json
        }
      }
      epi_requests: {
        Row: {
          id: string
          obra_id: string
          obra_name: string
          obra_type: string
          collected_data: Json
          request_data: Json
          total_summary: Json
          created_at: string
          created_by_id: string | null
          created_by_name: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          obra_id: string
          obra_name: string
          obra_type: string
          collected_data: Json
          request_data: Json
          total_summary: Json
          created_at?: string
          created_by_id?: string | null
          created_by_name?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          obra_id?: string
          obra_name?: string
          obra_type?: string
          collected_data?: Json
          request_data?: Json
          total_summary?: Json
          created_at?: string
          created_by_id?: string | null
          created_by_name?: string | null
          status?: string
          updated_at?: string | null
        }
      }
      index_entries: {
        Row: {
          id: string
          mes: number
          ano: number
          valor: number
          tipo: 'IPC-DI' | 'IGP-M' | 'IPCA'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mes: number
          ano: number
          valor: number
          tipo: 'IPC-DI' | 'IGP-M' | 'IPCA'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mes?: number
          ano?: number
          valor?: number
          tipo?: 'IPC-DI' | 'IGP-M' | 'IPCA'
          created_at?: string
          updated_at?: string
        }
      }
      parcelas_desconsiderar: {
        Row: {
          id: string
          descricao: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          descricao: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          descricao?: string
          created_at?: string
          updated_at?: string
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
