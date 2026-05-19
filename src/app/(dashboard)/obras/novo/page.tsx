import { createClient } from '@/lib/supabase/server'
import { SiteForm } from '@/components/site-form'

export default async function NovaObraPage() {
  const supabase = await createClient()
  const { data: responsaveis } = await supabase
    .from('responsaveis')
    .select('id, nome, cargo')
    .eq('ativo', true)
    .order('nome')

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Nova Obra</h1>
      <div className="bg-white rounded-lg border p-6">
        <SiteForm responsaveis={responsaveis ?? []} />
      </div>
    </div>
  )
}
