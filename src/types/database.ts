// Este ficheiro será substituído pelos tipos gerados automaticamente pelo Supabase.
// Para gerar: npx supabase gen types typescript --project-id <ID> > src/types/database.ts

export type Database = {
  public: {
    Tables: {
      workers: {
        Row: {
          id: string
          nome: string
          telefone: string | null
          email: string | null
          cargo: string | null
          data_admissao: string | null
          ativo: boolean
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['workers']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['workers']['Insert']>
      }
      teams: {
        Row: {
          id: string
          nome: string
          cor: string
          notas: string | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['teams']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['teams']['Insert']>
      }
      team_members: {
        Row: {
          team_id: string
          worker_id: string
          data_inicio: string
          data_fim: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['team_members']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['team_members']['Insert']>
      }
      equipment: {
        Row: {
          id: string
          nome: string
          tipo: string | null
          numero_serie: string | null
          notas: string | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['equipment']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['equipment']['Insert']>
      }
      sites: {
        Row: {
          id: string
          nome: string
          cliente: string | null
          morada: string | null
          data_inicio: string | null
          data_fim_prevista: string | null
          valor: number | null
          estado: 'em_curso' | 'concluida' | 'pausada'
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['sites']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['sites']['Insert']>
      }
      assignments: {
        Row: {
          id: string
          data: string
          periodo: 'manha' | 'tarde'
          team_id: string
          site_id: string
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['assignments']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['assignments']['Insert']>
      }
      assignment_equipment: {
        Row: {
          assignment_id: string
          equipment_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['assignment_equipment']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['assignment_equipment']['Insert']>
      }
    }
  }
}
