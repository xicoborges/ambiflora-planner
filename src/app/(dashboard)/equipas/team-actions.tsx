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
import { toggleTeamAtivo } from '@/lib/actions/teams'
import type { Database } from '@/types/database'

type Team = Database['public']['Tables']['teams']['Row']

export function TeamActions({ team }: { team: Team }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const result = await toggleTeamAtivo(team.id, team.ativo)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(team.ativo ? 'Equipa desativada' : 'Equipa ativada')
    }
    setLoading(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" disabled={loading} />}>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/equipas/${team.id}`)}>
          <Pencil className="h-4 w-4 mr-2" />
          Editar / Gerir Membros
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleToggle}>
          {team.ativo
            ? <><PowerOff className="h-4 w-4 mr-2" />Desativar</>
            : <><Power className="h-4 w-4 mr-2" />Ativar</>
          }
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
