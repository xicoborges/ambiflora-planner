import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteForm } from '@/components/site-form'

export default async function EditarObraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: site } = await supabase.from('sites').select('*').eq('id', id).single()

  if (!site) notFound()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Editar Obra</h1>
      <div className="bg-white rounded-lg border p-6">
        <SiteForm site={site} />
      </div>
    </div>
  )
}
