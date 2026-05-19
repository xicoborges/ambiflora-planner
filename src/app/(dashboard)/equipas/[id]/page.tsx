import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TeamForm } from '@/components/team-form'
import { TeamMembersPanel } from './team-members-panel'

export default async function EditarEquipaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: team }, { data: members }, { data: allWorkers }] = await Promise.all([
    supabase.from('teams').select('*').eq('id', id).single(),
    supabase
      .from('team_members')
      .select('*, workers(id, nome, cargo)')
      .eq('team_id', id)
      .is('data_fim', null),
    supabase.from('workers').select('id, nome, cargo').eq('ativo', true).order('nome'),
  ])

  if (!team) notFound()

  const memberWorkerIds = new Set(members?.map(m => m.worker_id) ?? [])
  const availableWorkers = allWorkers?.filter(w => !memberWorkerIds.has(w.id)) ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Editar Equipa</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Dados da Equipa</h2>
          <TeamForm team={team} />
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Membros</h2>
          <TeamMembersPanel
            teamId={id}
            members={members ?? []}
            availableWorkers={availableWorkers}
          />
        </div>
      </div>
    </div>
  )
}
