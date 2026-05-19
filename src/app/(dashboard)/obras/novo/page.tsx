import { SiteForm } from '@/components/site-form'

export default function NovaObraPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Nova Obra</h1>
      <div className="bg-white rounded-lg border p-6">
        <SiteForm />
      </div>
    </div>
  )
}
