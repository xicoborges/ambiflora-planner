'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createSite, updateSite } from '@/lib/actions/sites'
import type { Database } from '@/types/database'

type Site = Database['public']['Tables']['sites']['Row']

export function SiteForm({ site }: { site?: Site }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = site
        ? await updateSite(site.id, formData)
        : await createSite(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(site ? 'Obra atualizada' : 'Obra criada')
        router.push('/obras')
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4 max-w-lg">
      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome da Obra *</Label>
        <Input id="nome" name="nome" defaultValue={site?.nome} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="cliente">Cliente</Label>
          <Input id="cliente" name="cliente" defaultValue={site?.cliente ?? ''} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="estado">Estado</Label>
          <Select name="estado" defaultValue={site?.estado ?? 'por_comecar'}>
            <SelectTrigger id="estado">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="por_comecar">Por Começar</SelectItem>
              <SelectItem value="em_curso">Em Curso</SelectItem>
              <SelectItem value="pausada">Em Pausa</SelectItem>
              <SelectItem value="concluida">Concluída</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="morada">Local</Label>
        <Input id="morada" name="morada" defaultValue={site?.morada ?? ''} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="data_inicio">Data de Início</Label>
          <Input id="data_inicio" name="data_inicio" type="date" defaultValue={site?.data_inicio ?? ''} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="data_fim_prevista">Prazo Previsto</Label>
          <Input id="data_fim_prevista" name="data_fim_prevista" type="date" defaultValue={site?.data_fim_prevista ?? ''} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="valor">Valor (€)</Label>
        <Input id="valor" name="valor" type="number" step="0.01" min="0" defaultValue={site?.valor ?? ''} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notas">Notas</Label>
        <Textarea id="notas" name="notas" rows={3} defaultValue={site?.notas ?? ''} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'A guardar...' : site ? 'Guardar Alterações' : 'Criar Obra'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/obras')}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
