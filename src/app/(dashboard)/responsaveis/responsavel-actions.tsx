'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, PowerOff, Power, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toggleResponsavelAtivo, deleteResponsavel } from '@/lib/actions/responsaveis'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import type { Database } from '@/types/database'

type Responsavel = Database['public']['Tables']['responsaveis']['Row']

export function ResponsavelActions({ responsavel }: { responsavel: Responsavel }) {
  const router = useRouter()
  const [toggling, startToggle] = useTransition()
  const [deleteOpen, setDeleteOpen] = useState(false)

  function handleToggle() {
    startToggle(async () => {
      const result = await toggleResponsavelAtivo(responsavel.id, responsavel.ativo)
      if (result.error) toast.error(result.error)
      else toast.success(responsavel.ativo ? 'Responsável desativado' : 'Responsável ativado')
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" disabled={toggling} />}>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/responsaveis/${responsavel.id}`)}>
            <Pencil className="h-4 w-4 mr-2" />Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggle}>
            {responsavel.ativo
              ? <><PowerOff className="h-4 w-4 mr-2" />Desativar</>
              : <><Power className="h-4 w-4 mr-2" />Ativar</>}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        description={`Apagar permanentemente "${responsavel.nome}"?`}
        onConfirm={() => deleteResponsavel(responsavel.id)}
        successMessage="Responsável eliminado"
      />
    </>
  )
}
