import { EquipmentForm } from '@/components/equipment-form'

export default function NovoEquipamentoPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Novo Equipamento</h1>
      <div className="bg-white rounded-lg border p-6">
        <EquipmentForm />
      </div>
    </div>
  )
}
