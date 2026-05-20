import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { CsvImportButton } from '@/components/csv-import-button'
import { bulkImportWorkers } from '@/lib/actions/imports'
import { WorkersTable } from './workers-table'

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

      <WorkersTable workers={workers ?? []} />
    </div>
  )
}
