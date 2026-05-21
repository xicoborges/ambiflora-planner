'use client'

import { useState, useTransition } from 'react'
import { UserPlus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { addTeamMember, removeTeamMember } from '@/lib/actions/teams'

interface Member {
  team_id: string
  worker_id: string
  data_inicio: string
  workers: { id: string; nome: string; cargo: string | null } | null
}

interface Worker {
  id: string
  nome: string
  cargo: string | null
}

interface Props {
  teamId: string
  members: Member[]
  availableWorkers: Worker[]
}

export function TeamMembersPanel({ teamId, members, availableWorkers }: Props) {
  const [selectedWorkerId, setSelectedWorkerId] = useState('')
  const [isPending, startTransition] = useTransition()
  const [removeTarget, setRemoveTarget] = useState<{ workerId: string; dataInicio: string; nome: string } | null>(null)

  function handleAdd() {
    if (!selectedWorkerId) return
    startTransition(async () => {
      const result = await addTeamMember(teamId, selectedWorkerId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Trabalhador adicionado à equipa')
        setSelectedWorkerId('')
      }
    })
  }

  return (
    <div className="space-y-4">
      {members.length === 0 ? (
        <p className="text-sm text-gray-400">Nenhum membro nesta equipa.</p>
      ) : (
        <ul className="divide-y">
          {members.map((m) => (
            <li key={`${m.worker_id}-${m.data_inicio}`} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">{m.workers?.nome}</p>
                {m.workers?.cargo && (
                  <p className="text-xs text-gray-500">{m.workers.cargo}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                disabled={isPending}
                onClick={() => setRemoveTarget({ workerId: m.worker_id, dataInicio: m.data_inicio, nome: m.workers?.nome ?? '' })}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {availableWorkers.length > 0 && (
        <div className="flex gap-2 pt-2 border-t">
          <Select value={selectedWorkerId} onValueChange={(v) => setSelectedWorkerId(v ?? '')}>
            <SelectTrigger className="flex-1">
              <span className={`flex flex-1 text-left text-sm ${!selectedWorkerId ? 'text-muted-foreground' : ''}`}>
                {selectedWorkerId
                  ? (availableWorkers.find(w => w.id === selectedWorkerId)?.nome ?? '—')
                  : 'Adicionar trabalhador...'}
              </span>
            </SelectTrigger>
            <SelectContent>
              {availableWorkers.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.nome}{w.cargo ? ` (${w.cargo})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} disabled={!selectedWorkerId || isPending} size="icon">
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!removeTarget}
        onOpenChange={(open) => { if (!open) setRemoveTarget(null) }}
        description={`Remover "${removeTarget?.nome}" desta equipa?`}
        onConfirm={() => removeTeamMember(teamId, removeTarget!.workerId, removeTarget!.dataInicio)}
        successMessage="Trabalhador removido da equipa"
      />
    </div>
  )
}
