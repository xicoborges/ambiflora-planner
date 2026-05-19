import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SiteActions } from './site-actions'

const estadoLabel: Record<string, string> = {
  em_curso: 'Em Curso',
  concluida: 'Concluída',
  pausada: 'Pausada',
}

const estadoVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  em_curso: 'default',
  concluida: 'secondary',
  pausada: 'outline',
}

export default async function ObrasPage() {
  const supabase = await createClient()
  const { data: sites } = await supabase
    .from('sites')
    .select('*')
    .order('nome')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Obras</h1>
        <Button render={<Link href="/obras/novo" />}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Obra
        </Button>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Cliente</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Prazo Previsto</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {sites?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Nenhuma obra registada.
                </td>
              </tr>
            )}
            {sites?.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{s.nome}</td>
                <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{s.cliente ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                  {s.data_fim_prevista
                    ? new Date(s.data_fim_prevista + 'T00:00:00').toLocaleDateString('pt-PT')
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={estadoVariant[s.estado]}>
                    {estadoLabel[s.estado]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <SiteActions site={s} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
