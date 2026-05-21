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
import { toggleWorkerAtivo, deleteWorker } from '@/lib/actions/workers'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import type { Database } from '@/types/database'

type Worker = Database['public']['Tables']['workers']['Row']

export function WorkerActions({ worker }: { worker: Worker }) {
  const router = useRouter()
  const [toggling, startToggle] = useTransition()
  const [deleteOpen, setDeleteOpen] = useState(false)

  function handleToggle() {
    startToggle(async () => {
      const result = await toggleWorkerAtivo(worker.id, worker.ativo)
      if (result.error) toast.error(result.error)
      else toast.success(worker.ativo ? 'Trabalhador desativado' : 'Trabalhador ativado')
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" disabled={toggling} />}>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/trabalhadores/${worker.id}`)}>
            <Pencil className="h-4 w-4 mr-2" />Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggle}>
            {worker.ativo
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
        description={`Apagar permanentemente "${worker.nome}"? Todas as suas alocações no calendário e membros de equipas também serão eliminados.`}
        onConfirm={() => deleteWorker(worker.id)}
        successMessage="Trabalhador eliminado"
      />
    </>
  )
}
