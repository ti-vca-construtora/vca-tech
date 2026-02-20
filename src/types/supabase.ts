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
      tb_dac: {
        Row: {
          id: string
          dac_number: string
          nome_pessoa: string
          cpf_cnpj_pessoa: string
          valor_liquido: number
          descricao_servico: string
          nome_empresa: string
          cnpj_empresa: string
          company_id: string | null
          usuario_email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dac_number: string
          nome_pessoa: string
          cpf_cnpj_pessoa: string
          valor_liquido: number
          descricao_servico: string
          nome_empresa: string
          cnpj_empresa: string
          company_id?: string | null
          usuario_email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dac_number?: string
          nome_pessoa?: string
          cpf_cnpj_pessoa?: string
          valor_liquido?: number
          descricao_servico?: string
          nome_empresa?: string
          cnpj_empresa?: string
          company_id?: string | null
          usuario_email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tb_dac_config: {
        Row: {
          id: string
          intervalo_dias: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          intervalo_dias?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          intervalo_dias?: number
          created_at?: string
          updated_at?: string
        }
      }
      tb_empresas: {
        Row: {
          id: string
          external_id: number
          name: string
          cnpj: string
          trade_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          external_id: number
          name: string
          cnpj: string
          trade_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          external_id?: number
          name?: string
          cnpj?: string
          trade_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      tb_rps: {
        Row: {
          id: string
          rps_number: string
          nome_razao_social: string
          cpf: string
          rg: string
          data_nascimento: string | null
          nome_mae: string
          pis: string | null
          estado: string
          municipio: string
          company_id: string | null
          nome_empresa: string | null
          cnpj_empresa: string | null
          descricao_servico: string
          valor_liquido: number
          forma_pagamento: string
          tipo_chave_pix: string | null
          chave_pix: string | null
          banco: string | null
          tipo_conta: string | null
          agencia: string | null
          conta: string | null
          cpf_cnpj_conta: string | null
          dados_terceiros: boolean
          created_at: string
        }
        Insert: {
          id?: string
          rps_number: string
          nome_razao_social: string
          cpf: string
          rg: string
          data_nascimento?: string | null
          nome_mae: string
          pis?: string | null
          estado: string
          municipio: string
          company_id?: string | null
          nome_empresa?: string | null
          cnpj_empresa?: string | null
          descricao_servico: string
          valor_liquido: number
          forma_pagamento: string
          tipo_chave_pix?: string | null
          chave_pix?: string | null
          banco?: string | null
          tipo_conta?: string | null
          agencia?: string | null
          conta?: string | null
          cpf_cnpj_conta?: string | null
          dados_terceiros?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          rps_number?: string
          nome_razao_social?: string
          cpf?: string
          rg?: string
          data_nascimento?: string | null
          nome_mae?: string
          pis?: string | null
          estado?: string
          municipio?: string
          company_id?: string | null
          nome_empresa?: string | null
          cnpj_empresa?: string | null
          descricao_servico?: string
          valor_liquido?: number
          forma_pagamento?: string
          tipo_chave_pix?: string | null
          chave_pix?: string | null
          banco?: string | null
          tipo_conta?: string | null
          agencia?: string | null
          conta?: string | null
          cpf_cnpj_conta?: string | null
          dados_terceiros?: boolean
          created_at?: string
        }
      }
      tb_rps_cadastros: {
        Row: {
          id: string
          nome_razao_social: string
          cpf: string
          rg: string
          data_nascimento: string | null
          nome_mae: string
          pis: string | null
          estado: string
          municipio: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome_razao_social: string
          cpf: string
          rg: string
          data_nascimento?: string | null
          nome_mae: string
          pis?: string | null
          estado: string
          municipio: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome_razao_social?: string
          cpf?: string
          rg?: string
          data_nascimento?: string | null
          nome_mae?: string
          pis?: string | null
          estado?: string
          municipio?: string
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
