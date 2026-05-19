'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, PauseCircle, PlayCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toggleSiteEstado } from '@/lib/actions/sites'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Site = Database['public']['Tables']['sites']['Row']

export function SiteActions({ site }: { site: Site }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleEstado(novoEstado: 'em_curso' | 'concluida' | 'pausada') {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('sites').update({ estado: novoEstado }).eq('id', site.id)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Estado atualizado')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" disabled={loading} />}>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/obras/${site.id}`)}>
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {site.estado !== 'em_curso' && (
          <DropdownMenuItem onClick={() => handleEstado('em_curso')}>
            <PlayCircle className="h-4 w-4 mr-2" />
            Marcar Em Curso
          </DropdownMenuItem>
        )}
        {site.estado !== 'pausada' && (
          <DropdownMenuItem onClick={() => handleEstado('pausada')}>
            <PauseCircle className="h-4 w-4 mr-2" />
            Marcar Pausada
          </DropdownMenuItem>
        )}
        {site.estado !== 'concluida' && (
          <DropdownMenuItem onClick={() => handleEstado('concluida')}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar Concluída
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
