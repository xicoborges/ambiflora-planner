import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { TeamsTable } from './teams-table'

export default async function EquipasPage() {
  const supabase = await createClient()
  const { data: teams } = await supabase
    .from('teams')
    .select('*, team_members(worker_id)')
    .order('nome')

  const ativas = teams?.filter(t => t.ativo).length ?? 0

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Equipas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {ativas} ativa{ativas !== 1 ? 's' : ''} · {teams?.length ?? 0} no total
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/equipas/novo" />}>
          <Plus className="h-4 w-4 mr-1.5" />
          Nova Equipa
        </Button>
      </div>

      <TeamsTable teams={teams ?? []} />
    </div>
  )
}
