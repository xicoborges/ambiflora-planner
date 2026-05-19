import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EquipmentActions } from './equipment-actions'

export default async function EquipamentosPage() {
  const supabase = await createClient()
  const { data: equipment } = await supabase
    .from('equipment')
    .select('*')
    .order('nome')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Equipamentos</h1>
        <Button render={<Link href="/equipamentos/novo" />}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Equipamento
        </Button>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Tipo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Nº de Série</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {equipment?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Nenhum equipamento registado.
                </td>
              </tr>
            )}
            {equipment?.map((e) => (
              <tr key={e.id} className={!e.ativo ? 'opacity-50' : ''}>
                <td className="px-4 py-3 font-medium text-gray-900">{e.nome}</td>
                <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{e.tipo ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{e.numero_serie ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={e.ativo ? 'default' : 'secondary'}>
                    {e.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <EquipmentActions equipment={e} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
