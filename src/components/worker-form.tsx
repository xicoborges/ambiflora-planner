'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createWorker, updateWorker } from '@/lib/actions/workers'
import type { Database } from '@/types/database'

type Worker = Database['public']['Tables']['workers']['Row']

interface WorkerFormProps {
  worker?: Worker
}

export function WorkerForm({ worker }: WorkerFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = worker
        ? await updateWorker(worker.id, formData)
        : await createWorker(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(worker ? 'Trabalhador atualizado' : 'Trabalhador criado')
        router.push('/trabalhadores')
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4 max-w-lg">
      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome *</Label>
        <Input id="nome" name="nome" defaultValue={worker?.nome} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="cargo">Cargo</Label>
          <Input id="cargo" name="cargo" defaultValue={worker?.cargo ?? ''} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="telefone">Telefone</Label>
          <Input id="telefone" name="telefone" defaultValue={worker?.telefone ?? ''} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={worker?.email ?? ''} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="data_admissao">Data de Admissão</Label>
          <Input id="data_admissao" name="data_admissao" type="date" defaultValue={worker?.data_admissao ?? ''} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notas">Notas</Label>
        <Textarea id="notas" name="notas" rows={3} defaultValue={worker?.notas ?? ''} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'A guardar...' : worker ? 'Guardar Alterações' : 'Criar Trabalhador'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/trabalhadores')}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
