// Tipos manuais — substituir por `npx supabase gen types typescript --project-id <ID>` quando disponível

export type Database = {
  public: {
    Tables: {
      workers: {
        Row: {
          id: string; nome: string; telefone: string | null; email: string | null
          cargo: string | null; data_admissao: string | null
          ativo: boolean; notas: string | null; created_at: string; updated_at: string
        }
        Insert: {
          id?: string; nome: string; telefone?: string | null; email?: string | null
          cargo?: string | null; data_admissao?: string | null
          ativo?: boolean; notas?: string | null
        }
        Update: {
          id?: string; nome?: string; telefone?: string | null; email?: string | null
          cargo?: string | null; data_admissao?: string | null
          ativo?: boolean; notas?: string | null
        }
        Relationships: []
      }
      responsaveis: {
        Row: {
          id: string; nome: string; cargo: string | null; telefone: string | null
          data_admissao: string | null; notas: string | null; ativo: boolean
          created_at: string; updated_at: string
        }
        Insert: {
          id?: string; nome: string; cargo?: string | null; telefone?: string | null
          data_admissao?: string | null; notas?: string | null; ativo?: boolean
        }
        Update: {
          id?: string; nome?: string; cargo?: string | null; telefone?: string | null
          data_admissao?: string | null; notas?: string | null; ativo?: boolean
        }
        Relationships: []
      }
      teams: {
        Row: {
          id: string; nome: string; cor: string; notas: string | null; ativo: boolean
          created_at: string; updated_at: string
        }
        Insert: {
          id?: string; nome: string; cor?: string; notas?: string | null; ativo?: boolean
        }
        Update: {
          id?: string; nome?: string; cor?: string; notas?: string | null; ativo?: boolean
        }
        Relationships: []
      }
      team_members: {
        Row: {
          team_id: string; worker_id: string; data_inicio: string; data_fim: string | null
          created_at: string; updated_at: string
        }
        Insert: {
          team_id: string; worker_id: string; data_inicio?: string; data_fim?: string | null
        }
        Update: {
          team_id?: string; worker_id?: string; data_inicio?: string; data_fim?: string | null
        }
        Relationships: [
          { foreignKeyName: "team_members_team_id_fkey"; columns: ["team_id"]; isOneToOne: false; referencedRelation: "teams"; referencedColumns: ["id"] },
          { foreignKeyName: "team_members_worker_id_fkey"; columns: ["worker_id"]; isOneToOne: false; referencedRelation: "workers"; referencedColumns: ["id"] }
        ]
      }
      equipment: {
        Row: {
          id: string; nome: string; tipo: string | null; numero_serie: string | null
          notas: string | null; ativo: boolean; created_at: string; updated_at: string
        }
        Insert: {
          id?: string; nome: string; tipo?: string | null; numero_serie?: string | null
          notas?: string | null; ativo?: boolean
        }
        Update: {
          id?: string; nome?: string; tipo?: string | null; numero_serie?: string | null
          notas?: string | null; ativo?: boolean
        }
        Relationships: []
      }
      sites: {
        Row: {
          id: string; nome: string; cliente: string | null; morada: string | null
          data_inicio: string | null; data_fim_prevista: string | null; valor: number | null
          estado: 'por_comecar' | 'em_curso' | 'concluida' | 'pausada'; notas: string | null
          responsavel_id: string | null; created_at: string; updated_at: string
        }
        Insert: {
          id?: string; nome: string; cliente?: string | null; morada?: string | null
          data_inicio?: string | null; data_fim_prevista?: string | null; valor?: number | null
          estado?: 'por_comecar' | 'em_curso' | 'concluida' | 'pausada'; notas?: string | null
          responsavel_id?: string | null
        }
        Update: {
          id?: string; nome?: string; cliente?: string | null; morada?: string | null
          data_inicio?: string | null; data_fim_prevista?: string | null; valor?: number | null
          estado?: 'por_comecar' | 'em_curso' | 'concluida' | 'pausada'; notas?: string | null
          responsavel_id?: string | null
        }
        Relationships: [
          { foreignKeyName: "sites_responsavel_id_fkey"; columns: ["responsavel_id"]; isOneToOne: false; referencedRelation: "responsaveis"; referencedColumns: ["id"] }
        ]
      }
      assignments: {
        Row: {
          id: string; data: string; periodo: 'manha' | 'tarde'
          team_id: string | null; worker_id: string | null; site_id: string
          notas: string | null; created_at: string; updated_at: string
        }
        Insert: {
          id?: string; data: string; periodo: 'manha' | 'tarde'
          team_id?: string | null; worker_id?: string | null; site_id: string
          notas?: string | null
        }
        Update: {
          id?: string; data?: string; periodo?: 'manha' | 'tarde'
          team_id?: string | null; worker_id?: string | null; site_id?: string
          notas?: string | null
        }
        Relationships: [
          { foreignKeyName: "assignments_team_id_fkey"; columns: ["team_id"]; isOneToOne: false; referencedRelation: "teams"; referencedColumns: ["id"] },
          { foreignKeyName: "assignments_worker_id_fkey"; columns: ["worker_id"]; isOneToOne: false; referencedRelation: "workers"; referencedColumns: ["id"] },
          { foreignKeyName: "assignments_site_id_fkey"; columns: ["site_id"]; isOneToOne: false; referencedRelation: "sites"; referencedColumns: ["id"] }
        ]
      }
      assignment_equipment: {
        Row: { assignment_id: string; equipment_id: string; created_at: string }
        Insert: { assignment_id: string; equipment_id: string }
        Update: { assignment_id?: string; equipment_id?: string }
        Relationships: [
          { foreignKeyName: "ae_assignment_id_fkey"; columns: ["assignment_id"]; isOneToOne: false; referencedRelation: "assignments"; referencedColumns: ["id"] },
          { foreignKeyName: "ae_equipment_id_fkey"; columns: ["equipment_id"]; isOneToOne: false; referencedRelation: "equipment"; referencedColumns: ["id"] }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      site_estado: 'por_comecar' | 'em_curso' | 'concluida' | 'pausada'
      assignment_periodo: 'manha' | 'tarde'
    }
    CompositeTypes: Record<string, never>
  }
}
