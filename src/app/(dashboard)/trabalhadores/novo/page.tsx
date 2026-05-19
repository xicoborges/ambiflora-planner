import { WorkerForm } from '@/components/worker-form'

export default function NovoTrabalhadorPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Novo Trabalhador</h1>
      <div className="bg-white rounded-lg border p-6">
        <WorkerForm />
      </div>
    </div>
  )
}
