import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EquipmentForm } from '@/components/equipment-form'

export default async function EditarEquipamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: equipment } = await supabase.from('equipment').select('*').eq('id', id).single()

  if (!equipment) notFound()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Editar Equipamento</h1>
      <div className="bg-white rounded-lg border p-6">
        <EquipmentForm equipment={equipment} />
      </div>
    </div>
  )
}
