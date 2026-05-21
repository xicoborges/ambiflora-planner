import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
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
      <div className="flex items-center gap-2">
        <Link href="/equipas"
          className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted transition-colors text-slate-500 hover:text-slate-700">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Editar Equipa</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="font-semibold text-slate-700 mb-4">Dados da Equipa</h2>
          <TeamForm team={team} />
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="font-semibold text-slate-700 mb-4">Membros</h2>
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
