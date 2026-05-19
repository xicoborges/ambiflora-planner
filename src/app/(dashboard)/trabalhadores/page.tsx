import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WorkerActions } from './worker-actions'

export default async function TrabalhadoresPage() {
  const supabase = await createClient()
  const { data: workers } = await supabase
    .from('workers')
    .select('*')
    .order('nome')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Trabalhadores</h1>
        <Button render={<Link href="/trabalhadores/novo" />}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Trabalhador
        </Button>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Cargo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Telefone</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {workers?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Nenhum trabalhador registado.
                </td>
              </tr>
            )}
            {workers?.map((w) => (
              <tr key={w.id} className={!w.ativo ? 'opacity-50' : ''}>
                <td className="px-4 py-3 font-medium text-gray-900">{w.nome}</td>
                <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{w.cargo ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{w.telefone ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={w.ativo ? 'default' : 'secondary'}>
                    {w.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <WorkerActions worker={w} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
