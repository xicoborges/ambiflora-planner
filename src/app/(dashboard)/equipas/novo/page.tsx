import { TeamForm } from '@/components/team-form'

export default function NovaEquipaPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Nova Equipa</h1>
      <div className="bg-white rounded-lg border p-6">
        <TeamForm />
      </div>
    </div>
  )
}
