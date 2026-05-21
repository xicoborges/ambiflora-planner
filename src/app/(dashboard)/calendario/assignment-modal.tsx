'use client'

import { useEffect, useState, useTransition } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { upsertAssignment } from '@/lib/actions/assignments'
import type { Assignment, SelectedCell } from './calendar-client'

const PERIODO_LABEL = { manha: 'Manhã', tarde: 'Tarde' }

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCell: SelectedCell | null
  teams: { id: string; nome: string; cor: string }[]
  sites: { id: string; nome: string }[]
  equipment: { id: string; nome: string }[]
  workers: { id: string; nome: string }[]
  existingAssignments: Assignment[]
}

function formatDatePT(dateStr: string) {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export function AssignmentModal({
  open, onOpenChange, selectedCell,
  teams, sites, equipment, workers, existingAssignments,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [mode, setMode] = useState<'equipa' | 'trabalhador'>('equipa')
  const [teamId, setTeamId] = useState('')
  const [workerId, setWorkerId] = useState('')
  const [siteId, setSiteId] = useState('')
  const [notas, setNotas] = useState('')
  const [equipmentIds, setEquipmentIds] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      setMode('equipa')
      setTeamId('')
      setWorkerId('')
      setSiteId('')
      setNotas('')
      setEquipmentIds([])
    }
  }, [open])

  const conflictingAssignments = existingAssignments.filter(a =>
    selectedCell &&
    a.data === selectedCell.data &&
    a.periodo === selectedCell.periodo
  )

  const occupiedTeamIds = new Set(conflictingAssignments.map(a => a.team_id).filter(Boolean))
  const occupiedWorkerIds = new Set(conflictingAssignments.map(a => a.worker_id).filter(Boolean))
  const occupiedEquipmentIds = new Set(
    conflictingAssignments.flatMap(a => a.assignment_equipment.map(e => e.equipment_id))
  )

  const teamConflict = mode === 'equipa' && teamId && occupiedTeamIds.has(teamId)
    ? conflictingAssignments.find(a => a.team_id === teamId)
    : null

  const workerConflict = mode === 'trabalhador' && workerId && occupiedWorkerIds.has(workerId)
    ? conflictingAssignments.find(a => a.worker_id === workerId)
    : null

  function toggleEquipment(id: string) {
    setEquipmentIds(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id])
  }

  function handleSubmit() {
    if (isPending) return
    if (!selectedCell || !siteId) {
      toast.error('Escolhe a obra')
      return
    }
    if (mode === 'equipa' && !teamId) { toast.error('Escolhe a equipa'); return }
    if (mode === 'trabalhador' && !workerId) { toast.error('Escolhe o trabalhador'); return }
    if (teamConflict) {
      toast.error(`Esta equipa já está alocada à obra "${teamConflict.sites?.nome}" neste período`)
      return
    }
    if (workerConflict) {
      toast.error(`Este trabalhador já está alocado à obra "${workerConflict.sites?.nome}" neste período`)
      return
    }
    startTransition(async () => {
      const result = await upsertAssignment({
        data: selectedCell.data,
        periodo: selectedCell.periodo,
        team_id: mode === 'equipa' ? teamId : null,
        worker_id: mode === 'trabalhador' ? workerId : null,
        site_id: siteId,
        notas,
        equipment_ids: equipmentIds,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Alocação criada')
        onOpenChange(false)
      }
    })
  }

  if (!selectedCell) return null

  const equipmentConflict = equipmentIds.some(id => occupiedEquipmentIds.has(id))
  const hasConflict = !!teamConflict || !!workerConflict || equipmentConflict
  const conflictMsg = teamConflict
    ? `Esta equipa já está alocada à obra "${teamConflict.sites?.nome}" neste período.`
    : workerConflict
    ? `Este trabalhador já está alocado à obra "${workerConflict.sites?.nome}" neste período.`
    : equipmentConflict
    ? 'Um ou mais equipamentos selecionados já estão alocados neste período.'
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Alocação</DialogTitle>
          <p className="text-sm text-gray-500">
            {formatDatePT(selectedCell.data)} — {PERIODO_LABEL[selectedCell.periodo]}
          </p>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {/* Toggle Equipa / Trabalhador */}
          <div className="flex rounded-lg border overflow-hidden text-sm">
            <button
              type="button"
              onClick={() => setMode('equipa')}
              className={`flex-1 py-1.5 font-medium transition-colors ${mode === 'equipa' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50 text-slate-600'}`}
            >
              Equipa
            </button>
            <button
              type="button"
              onClick={() => setMode('trabalhador')}
              className={`flex-1 py-1.5 font-medium transition-colors border-l ${mode === 'trabalhador' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50 text-slate-600'}`}
            >
              Trabalhador
            </button>
          </div>

          {/* Equipa ou Trabalhador */}
          {mode === 'equipa' ? (
            <div className="space-y-1">
              <Label>Equipa *</Label>
              <Select value={teamId} onValueChange={v => setTeamId(v ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Escolher equipa...">
                    {teamId ? teams.find(t => t.id === teamId)?.nome : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {teams.map(t => {
                    const occupied = occupiedTeamIds.has(t.id)
                    return (
                      <SelectItem key={t.id} value={t.id} disabled={occupied}>
                        <span className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full inline-block shrink-0" style={{ backgroundColor: t.cor }} />
                          {t.nome}
                          {occupied && <span className="text-xs text-red-500 ml-1">Ocupada</span>}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-1">
              <Label>Trabalhador *</Label>
              <Select value={workerId} onValueChange={v => setWorkerId(v ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Escolher trabalhador...">
                    {workerId ? workers.find(w => w.id === workerId)?.nome : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {workers.map(w => {
                    const occupied = occupiedWorkerIds.has(w.id)
                    return (
                      <SelectItem key={w.id} value={w.id} disabled={occupied}>
                        {w.nome}
                        {occupied && <span className="text-xs text-red-500 ml-1">Ocupado</span>}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {conflictMsg && (
            <div className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              {conflictMsg}
            </div>
          )}

          {/* Obra */}
          <div className="space-y-1">
            <Label>Obra *</Label>
            <Select value={siteId} onValueChange={v => setSiteId(v ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolher obra...">
                  {siteId ? sites.find(s => s.id === siteId)?.nome : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sites.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Equipamentos */}
          <div className="space-y-1">
            <Label>Equipamentos</Label>
            {equipment.length === 0 ? (
              <p className="text-xs text-gray-400 py-1">
                Nenhum equipamento registado.{' '}
                <a href="/equipamentos/novo" className="underline text-primary">Adicionar equipamento</a>
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {equipment.map(eq => {
                  const occupied = occupiedEquipmentIds.has(eq.id)
                  const checked = equipmentIds.includes(eq.id)
                  return (
                    <label
                      key={eq.id}
                      className={`flex items-center gap-2 text-sm rounded-md border px-2 py-1.5 cursor-pointer transition-colors ${
                        occupied && !checked
                          ? 'opacity-40 cursor-not-allowed bg-gray-50'
                          : checked
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={occupied && !checked}
                        onChange={() => !occupied && toggleEquipment(eq.id)}
                        className="accent-primary"
                      />
                      <span className="truncate">{eq.nome}</span>
                      {occupied && !checked && (
                        <span className="text-[10px] text-red-500 ml-auto shrink-0">Ocupado</span>
                      )}
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          {/* Notas */}
          <div className="space-y-1">
            <Label>Notas</Label>
            <Textarea rows={2} value={notas} onChange={e => setNotas(e.target.value)} placeholder="Observações opcionais..." />
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" size="sm" />}>Cancelar</DialogClose>
          <Button
            size="sm"
            disabled={isPending || !siteId || (mode === 'equipa' ? !teamId : !workerId) || hasConflict}
            onClick={handleSubmit}
          >
            {isPending ? 'A guardar...' : 'Criar Alocação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
