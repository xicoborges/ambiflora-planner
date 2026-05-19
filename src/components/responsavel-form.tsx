'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createResponsavel, updateResponsavel } from '@/lib/actions/responsaveis'
import type { Database } from '@/types/database'

type Responsavel = Database['public']['Tables']['responsaveis']['Row']

export function ResponsavelForm({ responsavel }: { responsavel?: Responsavel }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = responsavel
        ? await updateResponsavel(responsavel.id, formData)
        : await createResponsavel(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(responsavel ? 'Responsável atualizado' : 'Responsável criado')
        router.push('/responsaveis')
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4 max-w-lg">
      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome *</Label>
        <Input id="nome" name="nome" defaultValue={responsavel?.nome} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="cargo">Cargo</Label>
          <Input id="cargo" name="cargo" defaultValue={responsavel?.cargo ?? ''} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="telefone">Telefone</Label>
          <Input id="telefone" name="telefone" defaultValue={responsavel?.telefone ?? ''} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="data_admissao">Data de Admissão</Label>
        <Input id="data_admissao" name="data_admissao" type="date" defaultValue={responsavel?.data_admissao ?? ''} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notas">Notas</Label>
        <Textarea id="notas" name="notas" rows={3} defaultValue={responsavel?.notas ?? ''} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'A guardar...' : responsavel ? 'Guardar Alterações' : 'Criar Responsável'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/responsaveis')}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
