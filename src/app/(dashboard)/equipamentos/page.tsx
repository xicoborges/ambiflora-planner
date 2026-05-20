import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { CsvImportButton } from '@/components/csv-import-button'
import { bulkImportEquipment } from '@/lib/actions/imports'
import { EquipmentTable } from './equipment-table'

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

      <EquipmentTable equipment={equipment ?? []} />
    </div>
  )
}
