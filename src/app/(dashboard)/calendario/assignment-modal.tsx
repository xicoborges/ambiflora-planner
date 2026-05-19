'use client'

import { useEffect, useState, useTransition } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { upsertAssignment, deleteAssignment } from '@/lib/actions/assignments'
import type { Assignment, SelectedCell } from './calendar-client'

const PERIODO_LABEL = { manha: 'Manhã', tarde: 'Tarde' }

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCell: SelectedCell | null
  selectedAssignment: Assignment | null
  teams: { id: string; nome: string; cor: string }[]
  sites: { id: string; nome: string }[]
  equipment: { id: string; nome: string }[]
  existingAssignments: Assignment[]
}

function formatDatePT(dateStr: string) {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export function AssignmentModal({
  open, onOpenChange, selectedCell, selectedAssignment,
  teams, sites, equipment, existingAssignments,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [teamId, setTeamId] = useState('')
  const [siteId, setSiteId] = useState('')
  const [notas, setNotas] = useState('')
  const [equipmentIds, setEquipmentIds] = useState<string[]>([])

  const isEdit = !!selectedAssignment

  useEffect(() => {
    if (open) {
      setTeamId(selectedAssignment?.team_id ?? '')
      setSiteId(selectedAssignment?.site_id ?? '')
      setNotas(selectedAssignment?.notas ?? '')
      setEquipmentIds(selectedAssignment?.assignment_equipment.map(e => e.equipment_id) ?? [])
    }
  }, [open, selectedAssignment])

  // Outras alocações no mesmo dia+período (exceto a que está a ser editada)
  const conflictingAssignments = existingAssignments.filter(a =>
    selectedCell &&
    a.data === selectedCell.data &&
    a.periodo === selectedCell.periodo &&
    a.id !== selectedAssignment?.id
  )

  // Equipas já ocupadas neste período
  const occupiedTeamIds = new Set(conflictingAssignments.map(a => a.team_id))

  // Equipamentos já ocupados neste período
  const occupiedEquipmentIds = new Set(
    conflictingAssignments.flatMap(a => a.assignment_equipment.map(e => e.equipment_id))
  )

  // Conflito de equipa: a equipa selecionada já está alocada neste período
  const teamConflict = teamId && occupiedTeamIds.has(teamId)
    ? conflictingAssignments.find(a => a.team_id === teamId)
    : null

  function toggleEquipment(id: string) {
    setEquipmentIds(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    )
  }

  function handleSubmit() {
    if (!selectedCell || !teamId || !siteId) {
      toast.error('Escolhe a equipa e a obra')
      return
    }
    if (teamConflict) {
      toast.error(`Esta equipa já está alocada à obra "${teamConflict.sites?.nome}" neste período`)
      return
    }
    startTransition(async () => {
      const result = await upsertAssignment({
        id: selectedAssignment?.id,
        data: selectedCell.data,
        periodo: selectedCell.periodo,
        team_id: teamId,
        site_id: siteId,
        notas,
        equipment_ids: equipmentIds,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(isEdit ? 'Alocação atualizada' : 'Alocação criada')
        onOpenChange(false)
      }
    })
  }

  function handleDelete() {
    if (!selectedAssignment) return
    startTransition(async () => {
      const result = await deleteAssignment(selectedAssignment.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Alocação eliminada')
        onOpenChange(false)
      }
    })
  }

  if (!selectedCell) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Alocação' : 'Nova Alocação'}</DialogTitle>
          <p className="text-sm text-gray-500">
            {formatDatePT(selectedCell.data)} — {PERIODO_LABEL[selectedCell.periodo]}
          </p>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {/* Equipa */}
          <div className="space-y-1">
            <Label>Equipa *</Label>
            <Select value={teamId} onValueChange={v => setTeamId(v ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolher equipa..." />
              </SelectTrigger>
              <SelectContent>
                {teams.map(t => {
                  const occupied = occupiedTeamIds.has(t.id) && t.id !== selectedAssignment?.team_id
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
            {teamConflict && (
              <div className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                Esta equipa já está alocada à obra <strong>{teamConflict.sites?.nome}</strong> neste período.
              </div>
            )}
          </div>

          {/* Obra */}
          <div className="space-y-1">
            <Label>Obra *</Label>
            <Select value={siteId} onValueChange={v => setSiteId(v ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolher obra..." />
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
                <a href="/equipamentos/novo" className="underline text-green-700">Adicionar equipamento</a>
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
                          ? 'border-green-600 bg-green-50 text-green-800'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={occupied && !checked}
                        onChange={() => !occupied && toggleEquipment(eq.id)}
                        className="accent-green-600"
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
            <Textarea
              rows={2}
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Observações opcionais..."
            />
          </div>
        </div>

        <DialogFooter>
          {isEdit && (
            <Button variant="destructive" size="sm" disabled={isPending} onClick={handleDelete} className="mr-auto">
              <Trash2 className="h-4 w-4 mr-1" />Eliminar
            </Button>
          )}
          <DialogClose render={<Button variant="outline" size="sm" />}>Cancelar</DialogClose>
          <Button size="sm" disabled={isPending || !teamId || !siteId || !!teamConflict} onClick={handleSubmit}>
            {isPending ? 'A guardar...' : isEdit ? 'Guardar' : 'Criar Alocação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
