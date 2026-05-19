'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createEquipment, updateEquipment } from '@/lib/actions/equipment'
import type { Database } from '@/types/database'

type Equipment = Database['public']['Tables']['equipment']['Row']

export function EquipmentForm({ equipment }: { equipment?: Equipment }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = equipment
        ? await updateEquipment(equipment.id, formData)
        : await createEquipment(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(equipment ? 'Equipamento atualizado' : 'Equipamento criado')
        router.push('/equipamentos')
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4 max-w-lg">
      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome *</Label>
        <Input id="nome" name="nome" defaultValue={equipment?.nome} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="tipo">Tipo</Label>
          <Input id="tipo" name="tipo" placeholder="Ex: Trator, Soprador..." defaultValue={equipment?.tipo ?? ''} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="numero_serie">Nº de Série</Label>
          <Input id="numero_serie" name="numero_serie" defaultValue={equipment?.numero_serie ?? ''} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notas">Notas</Label>
        <Textarea id="notas" name="notas" rows={3} defaultValue={equipment?.notas ?? ''} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'A guardar...' : equipment ? 'Guardar Alterações' : 'Criar Equipamento'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/equipamentos')}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
