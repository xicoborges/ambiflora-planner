import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ResponsavelForm } from '@/components/responsavel-form'

export default async function EditarResponsavelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: responsavel } = await supabase.from('responsaveis').select('*').eq('id', id).single()
  if (!responsavel) notFound()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Editar Responsável</h1>
      <div className="bg-white rounded-lg border p-6">
        <ResponsavelForm responsavel={responsavel} />
      </div>
    </div>
  )
}
