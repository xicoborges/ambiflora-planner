import Link from 'next/link'
import { Plus, Wrench } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EquipmentActions } from './equipment-actions'
import { CsvImportButton } from '@/components/csv-import-button'
import { bulkImportEquipment } from '@/lib/actions/imports'

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
        <div className="flex items-center gap-2">
          <CsvImportButton
            action={bulkImportEquipment}
            entityName="equipamento"
            templateHeaders={['nome', 'tipo', 'numero_serie', 'notas']}
            sampleRow={['Corta-relva Honda', 'Corta-relva', 'SN-123456', '']}
            templateFilename="modelo_equipamentos.csv"
          />
          <Button nativeButton={false} render={<Link href="/equipamentos/novo" />}>
            <Plus className="h-4 w-4 mr-1.5" />
            Novo Equipamento
          </Button>
        </div>
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
                  <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <Wrench className="h-7 w-7 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Sem equipamentos registados</p>
                  <p className="text-xs text-muted-foreground mt-1">Adiciona máquinas, veículos ou ferramentas utilizados nas obras.</p>
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
