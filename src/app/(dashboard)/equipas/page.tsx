import Link from 'next/link'
import { Plus, Users } from 'lucide-react'
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Equipas</h1>
        <Button render={<Link href="/equipas/novo" />}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Equipa
        </Button>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Cor</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Membros</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {teams?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Nenhuma equipa registada.
                </td>
              </tr>
            )}
            {teams?.map((t) => (
              <tr key={t.id} className={!t.ativo ? 'opacity-50' : ''}>
                <td className="px-4 py-3 font-medium text-gray-900">{t.nome}</td>
                <td className="px-4 py-3">
                  <span
                    className="inline-block h-5 w-5 rounded-full border border-gray-200"
                    style={{ backgroundColor: t.cor }}
                  />
                </td>
                <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {t.team_members?.length ?? 0}
                  </span>
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
