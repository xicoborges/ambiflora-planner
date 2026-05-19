import Link from 'next/link'
import { Plus, UsersRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TeamActions } from './team-actions'

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
            {ativas} activa{ativas !== 1 ? 's' : ''} · {teams?.length ?? 0} no total
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/equipas/novo" />}>
          <Plus className="h-4 w-4 mr-1.5" />
          Nova Equipa
        </Button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Equipa</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Cor</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden sm:table-cell">Membros</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {teams?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-14 text-center">
                  <UsersRound className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma equipa criada.</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Cria equipas e atribui trabalhadores para as alocar no calendário.</p>
                </td>
              </tr>
            )}
            {teams?.map((t) => (
              <tr key={t.id} className={`hover:bg-muted/30 transition-colors ${!t.ativo ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-900">{t.nome}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center gap-1.5 text-xs text-slate-600"
                  >
                    <span
                      className="inline-block h-4 w-4 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: t.cor }}
                    />
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                  {t.team_members?.length ?? 0} membro{(t.team_members?.length ?? 0) !== 1 ? 's' : ''}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={t.ativo ? 'default' : 'secondary'}>
                    {t.ativo ? 'Ativa' : 'Inativa'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <TeamActions team={t} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
