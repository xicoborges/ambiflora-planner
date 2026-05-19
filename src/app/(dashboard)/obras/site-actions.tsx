'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, PauseCircle, PlayCircle, CheckCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteSite } from '@/lib/actions/sites'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Site = Database['public']['Tables']['sites']['Row']

export function SiteActions({ site }: { site: Site }) {
  const router = useRouter()
  const [updating, startUpdate] = useTransition()
  const [deleteOpen, setDeleteOpen] = useState(false)

  function handleEstado(novoEstado: 'por_comecar' | 'em_curso' | 'concluida' | 'pausada') {
    startUpdate(async () => {
      const supabase = createClient()
      const { error } = await supabase.from('sites').update({ estado: novoEstado }).eq('id', site.id)
      if (error) toast.error(error.message)
      else { toast.success('Estado atualizado'); router.refresh() }
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" disabled={updating} />}>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/obras/${site.id}`)}>
            <Pencil className="h-4 w-4 mr-2" />Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {site.estado !== 'por_comecar' && (
            <DropdownMenuItem onClick={() => handleEstado('por_comecar')}>
              <PlayCircle className="h-4 w-4 mr-2" />Por Começar
            </DropdownMenuItem>
          )}
          {site.estado !== 'em_curso' && (
            <DropdownMenuItem onClick={() => handleEstado('em_curso')}>
              <PlayCircle className="h-4 w-4 mr-2" />Em Curso
            </DropdownMenuItem>
          )}
          {site.estado !== 'pausada' && (
            <DropdownMenuItem onClick={() => handleEstado('pausada')}>
              <PauseCircle className="h-4 w-4 mr-2" />Em Pausa
            </DropdownMenuItem>
          )}
          {site.estado !== 'concluida' && (
            <DropdownMenuItem onClick={() => handleEstado('concluida')}>
              <CheckCircle className="h-4 w-4 mr-2" />Concluída
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        description={`Apagar permanentemente "${site.nome}"? Todas as alocações desta obra também serão apagadas.`}
        onConfirm={() => deleteSite(site.id)}
        successMessage="Obra eliminada"
      />
    </>
  )
}
