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
import { toggleTeamAtivo, deleteTeam } from '@/lib/actions/teams'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import type { Database } from '@/types/database'

type Team = Database['public']['Tables']['teams']['Row']

export function TeamActions({ team }: { team: Team }) {
  const router = useRouter()
  const [toggling, startToggle] = useTransition()
  const [deleteOpen, setDeleteOpen] = useState(false)

  function handleToggle() {
    startToggle(async () => {
      const result = await toggleTeamAtivo(team.id, team.ativo)
      if (result.error) toast.error(result.error)
      else toast.success(team.ativo ? 'Equipa desativada' : 'Equipa ativada')
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" disabled={toggling} />}>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/equipas/${team.id}`)}>
            <Pencil className="h-4 w-4 mr-2" />Editar / Gerir Membros
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggle}>
            {team.ativo
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
        description={`Apagar permanentemente "${team.nome}"? Todas as alocações desta equipa também serão apagadas.`}
        onConfirm={() => deleteTeam(team.id)}
        successMessage="Equipa eliminada"
      />
    </>
  )
}
