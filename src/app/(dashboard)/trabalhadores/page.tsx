import Link from 'next/link'
import { Plus, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WorkerActions } from './worker-actions'
import { CsvImportButton } from '@/components/csv-import-button'
import { bulkImportWorkers } from '@/lib/actions/imports'

export default async function TrabalhadoresPage() {
  const supabase = await createClient()
  const { data: workers } = await supabase
    .from('workers')
    .select('*')
    .order('nome')

  const ativos = workers?.filter(w => w.ativo).length ?? 0

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trabalhadores</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {ativos} activo{ativos !== 1 ? 's' : ''} · {workers?.length ?? 0} no total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CsvImportButton
            action={bulkImportWorkers}
            entityName="trabalhador"
            templateHeaders={['nome', 'cargo', 'telefone', 'email', 'data_admissao', 'notas']}
            sampleRow={['João Silva', 'Jardineiro', '912345678', 'joao@ambiflora.pt', '2024-01-15', '']}
            templateFilename="modelo_trabalhadores.csv"
          />
          <Button nativeButton={false} render={<Link href="/trabalhadores/novo" />}>
            <Plus className="h-4 w-4 mr-1.5" />
            Novo Trabalhador
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden sm:table-cell">Cargo</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Telefone</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {workers?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-14 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <Users className="h-7 w-7 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Sem trabalhadores registados</p>
                  <p className="text-xs text-muted-foreground mt-1">Adiciona manualmente ou importa um ficheiro CSV.</p>
                </td>
              </tr>
            )}
            {workers?.map((w) => (
              <tr key={w.id} className={`hover:bg-muted/30 transition-colors ${!w.ativo ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 font-medium text-slate-900">{w.nome}</td>
                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{w.cargo ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{w.telefone ?? '—'}</td>
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
