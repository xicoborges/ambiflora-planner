import { createClient } from '@/lib/supabase/server'
import { CalendarClient } from './calendar-client'

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; mes?: string }>
}) {
  const params = await searchParams
  const now = new Date()
  const ano = parseInt(params.ano ?? String(now.getFullYear()))
  const mes = parseInt(params.mes ?? String(now.getMonth() + 1))

  const startDate = `${ano}-${String(mes).padStart(2, '0')}-01`
  const lastDay = new Date(ano, mes, 0).getDate()
  const endDate = `${ano}-${String(mes).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const supabase = await createClient()

  const [
    { data: assignments },
    { data: teams },
    { data: sites },
    { data: workers },
    { data: equipment },
    { data: teamMembers },
  ] = await Promise.all([
    supabase
      .from('assignments')
      .select('id, data, periodo, team_id, worker_id, site_id, notas, teams(id, nome, cor), workers(id, nome), sites(id, nome), assignment_equipment(equipment_id)')
      .gte('data', startDate)
      .lte('data', endDate),
    supabase.from('teams').select('id, nome, cor').eq('ativo', true).order('nome'),
    supabase.from('sites').select('id, nome').neq('estado', 'concluida').order('nome'),
    supabase.from('workers').select('id, nome').eq('ativo', true).order('nome'),
    supabase.from('equipment').select('id, nome').eq('ativo', true).order('nome'),
    supabase.from('team_members').select('team_id, worker_id').is('data_fim', null),
  ])

  return (
    <CalendarClient
      ano={ano}
      mes={mes}
      assignments={(assignments ?? []) as any}
      teams={teams ?? []}
      sites={sites ?? []}
      workers={workers ?? []}
      equipment={equipment ?? []}
      teamMembers={teamMembers ?? []}
    />
  )
}
