'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
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

export function SiteForm({ site, responsaveis = [] }: {
  site?: Site
  responsaveis?: { id: string; nome: string; cargo: string | null }[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [responsavelId, setResponsavelId] = useState(site?.responsavel_id ?? '')
  const [estado, setEstado] = useState(site?.estado ?? 'por_comecar')

  const ESTADO_LABELS: Record<string, string> = {
    por_comecar: 'Por Começar',
    em_curso: 'Em Curso',
    pausada: 'Em Pausa',
    concluida: 'Concluída',
  }

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
          <Select value={estado} onValueChange={v => setEstado(v || 'por_comecar')}>
            <SelectTrigger id="estado">
              <SelectValue>{ESTADO_LABELS[estado]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="por_comecar">Por Começar</SelectItem>
              <SelectItem value="em_curso">Em Curso</SelectItem>
              <SelectItem value="pausada">Em Pausa</SelectItem>
              <SelectItem value="concluida">Concluída</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="estado" value={estado} />
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
        <Label htmlFor="responsavel_id">Pessoa Responsável</Label>
        <Select value={responsavelId} onValueChange={v => setResponsavelId(v ?? '')}>
          <SelectTrigger id="responsavel_id">
            <SelectValue placeholder="Nenhuma">
              {responsavelId ? (responsaveis.find(r => r.id === responsavelId)?.nome ?? null) : null}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="min-w-72">
            <SelectItem value="">Nenhuma</SelectItem>
            {responsaveis.map(r => (
              <SelectItem key={r.id} value={r.id}>{r.nome}{r.cargo ? ` — ${r.cargo}` : ''}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="responsavel_id" value={responsavelId} />
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
