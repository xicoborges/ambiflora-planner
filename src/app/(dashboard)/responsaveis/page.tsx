import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { CsvImportButton } from '@/components/csv-import-button'
import { bulkImportResponsaveis } from '@/lib/actions/imports'
import { ResponsaveisTable } from './responsaveis-table'

export default async function ResponsaveisPage() {
  const supabase = await createClient()
  const { data: responsaveis } = await supabase
    .from('responsaveis')
    .select('*')
    .order('data_admissao', { ascending: true, nullsFirst: false })

  const ativos = responsaveis?.filter(r => r.ativo).length ?? 0

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Responsáveis</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {ativos} ativo{ativos !== 1 ? 's' : ''} · {responsaveis?.length ?? 0} no total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CsvImportButton
            action={bulkImportResponsaveis}
            entityName="responsável"
            templateHeaders={['nome', 'cargo', 'telefone', 'data_admissao', 'notas']}
            sampleRow={['Maria Santos', 'Encarregado', '961234567', '2023-06-01', '']}
            templateFilename="modelo_responsaveis.csv"
          />
          <Button nativeButton={false} render={<Link href="/responsaveis/novo" />}>
            <Plus className="h-4 w-4 mr-1.5" />
            Novo Responsável
          </Button>
        </div>
      </div>

      <ResponsaveisTable responsaveis={responsaveis ?? []} />
    </div>
  )
}
