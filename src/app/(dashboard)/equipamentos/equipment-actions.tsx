'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, PowerOff, Power } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toggleEquipmentAtivo } from '@/lib/actions/equipment'
import type { Database } from '@/types/database'

type Equipment = Database['public']['Tables']['equipment']['Row']

export function EquipmentActions({ equipment }: { equipment: Equipment }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const result = await toggleEquipmentAtivo(equipment.id, equipment.ativo)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(equipment.ativo ? 'Equipamento desativado' : 'Equipamento ativado')
    }
    setLoading(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" disabled={loading} />}>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/equipamentos/${equipment.id}`)}>
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleToggle}>
          {equipment.ativo
            ? <><PowerOff className="h-4 w-4 mr-2" />Desativar</>
            : <><Power className="h-4 w-4 mr-2" />Ativar</>
          }
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
