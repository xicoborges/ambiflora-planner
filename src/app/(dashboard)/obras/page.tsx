import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { CsvImportButton } from '@/components/csv-import-button'
import { bulkImportSites } from '@/lib/actions/imports'
import { ObrasTable } from './obras-table'

export default async function ObrasPage() {
  const supabase = await createClient()
  const { data: sites } = await supabase
    .from('sites')
    .select('*, responsaveis(nome)')
    .order('nome') as any

  const emCurso = (sites as any[])?.filter((s: any) => s.estado === 'em_curso').length ?? 0

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Obras</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {emCurso} em curso · {(sites as any[])?.length ?? 0} no total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CsvImportButton
            action={bulkImportSites}
            entityName="obra"
            templateHeaders={['nome', 'cliente', 'morada', 'estado', 'data_inicio', 'data_fim_prevista', 'valor', 'notas']}
            sampleRow={['Jardim da Quinta', 'Cliente ABC', 'Rua das Flores 10, Lisboa', 'em_curso', '2025-03-01', '2025-09-30', '15000', '']}
            templateFilename="modelo_obras.csv"
          />
          <Button nativeButton={false} render={<Link href="/obras/novo" />}>
            <Plus className="h-4 w-4 mr-1.5" />
            Nova Obra
          </Button>
        </div>
      </div>

      <ObrasTable sites={(sites as any[]) ?? []} />
    </div>
  )
}
