import Link from 'next/link'
import { Plus, Wrench } from 'lucide-react'
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

  const ativos = equipment?.filter(e => e.ativo).length ?? 0

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Equipamentos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {ativos} activo{ativos !== 1 ? 's' : ''} · {equipment?.length ?? 0} no total
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/equipamentos/novo" />}>
          <Plus className="h-4 w-4 mr-1.5" />
          Novo Equipamento
        </Button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden sm:table-cell">Tipo</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Nº de Série</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {equipment?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-14 text-center">
                  <Wrench className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum equipamento registado.</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Adiciona máquinas, veículos ou ferramentas utilizados nas obras.</p>
                </td>
              </tr>
            )}
            {equipment?.map((e) => (
              <tr key={e.id} className={`hover:bg-muted/30 transition-colors ${!e.ativo ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 font-medium text-slate-900">{e.nome}</td>
                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{e.tipo ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{e.numero_serie ?? '—'}</td>
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
