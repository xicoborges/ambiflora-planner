import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WorkerForm } from '@/components/worker-form'

export default async function EditarTrabalhadorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: worker } = await supabase.from('workers').select('*').eq('id', id).single()

  if (!worker) notFound()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Editar Trabalhador</h1>
      <div className="bg-white rounded-lg border p-6">
        <WorkerForm worker={worker} />
      </div>
    </div>
  )
}
