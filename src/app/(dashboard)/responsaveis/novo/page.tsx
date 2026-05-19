import { ResponsavelForm } from '@/components/responsavel-form'

export default function NovoResponsavelPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Novo Responsável</h1>
      <div className="bg-white rounded-lg border p-6">
        <ResponsavelForm />
      </div>
    </div>
  )
}
