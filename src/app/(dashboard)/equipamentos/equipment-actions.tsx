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
import { toggleEquipmentAtivo, deleteEquipment } from '@/lib/actions/equipment'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import type { Database } from '@/types/database'

type Equipment = Database['public']['Tables']['equipment']['Row']

export function EquipmentActions({ equipment }: { equipment: Equipment }) {
  const router = useRouter()
  const [toggling, startToggle] = useTransition()
  const [deleteOpen, setDeleteOpen] = useState(false)

  function handleToggle() {
    startToggle(async () => {
      const result = await toggleEquipmentAtivo(equipment.id, equipment.ativo)
      if (result.error) toast.error(result.error)
      else toast.success(equipment.ativo ? 'Equipamento desativado' : 'Equipamento ativado')
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" disabled={toggling} />}>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/equipamentos/${equipment.id}`)}>
            <Pencil className="h-4 w-4 mr-2" />Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggle}>
            {equipment.ativo
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
        description={`Apagar permanentemente "${equipment.nome}"? Será removido de todas as alocações existentes.`}
        onConfirm={() => deleteEquipment(equipment.id)}
        successMessage="Equipamento eliminado"
      />
    </>
  )
}
