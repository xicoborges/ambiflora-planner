'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createTeam, updateTeam } from '@/lib/actions/teams'
import type { Database } from '@/types/database'

type Team = Database['public']['Tables']['teams']['Row']

const PRESET_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
]

export function TeamForm({ team }: { team?: Team }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = team
        ? await updateTeam(team.id, formData)
        : await createTeam(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(team ? 'Equipa atualizada' : 'Equipa criada')
        router.push(team ? `/equipas/${team.id}` : '/equipas')
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4 max-w-lg">
      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome da Equipa *</Label>
        <Input id="nome" name="nome" defaultValue={team?.nome} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cor">Cor de Identificação</Label>
        <div className="flex items-center gap-3">
          <Input id="cor" name="cor" type="color" defaultValue={team?.cor ?? '#3B82F6'}
            className="w-12 h-9 p-1 cursor-pointer" />
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                type="button"
                className="h-6 w-6 rounded-full border-2 border-transparent hover:border-gray-400 transition-colors"
                style={{ backgroundColor: c }}
                onClick={() => {
                  const input = document.getElementById('cor') as HTMLInputElement
                  if (input) input.value = c
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notas">Notas</Label>
        <Textarea id="notas" name="notas" rows={3} defaultValue={team?.notas ?? ''} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'A guardar...' : team ? 'Guardar Alterações' : 'Criar Equipa'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/equipas')}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
