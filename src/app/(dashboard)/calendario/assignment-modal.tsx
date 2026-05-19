'use client'

import { useEffect, useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { DialogClose } from '@/components/ui/dialog'
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

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setTeamId(selectedAssignment?.team_id ?? '')
      setSiteId(selectedAssignment?.site_id ?? '')
      setNotas(selectedAssignment?.notas ?? '')
      setEquipmentIds(selectedAssignment?.assignment_equipment.map(e => e.equipment_id) ?? [])
    }
  }, [open, selectedAssignment])

  // Equipment occupied in this day+period (by other assignments)
  const occupiedEquipment = new Set(
    existingAssignments
      .filter(a =>
        selectedCell &&
        a.data === selectedCell.data &&
        a.periodo === selectedCell.periodo &&
        a.id !== selectedAssignment?.id
      )
      .flatMap(a => a.assignment_equipment.map(e => e.equipment_id))
  )

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
          <DialogTitle>
            {isEdit ? 'Editar Alocação' : 'Nova Alocação'}
          </DialogTitle>
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
                {teams.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full inline-block shrink-0" style={{ backgroundColor: t.cor }} />
                      {t.nome}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          {equipment.length > 0 && (
            <div className="space-y-1">
              <Label>Equipamentos</Label>
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {equipment.map(eq => {
                  const occupied = occupiedEquipment.has(eq.id)
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
            </div>
          )}

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
            <Button
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={handleDelete}
              className="mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Eliminar
            </Button>
          )}
          <DialogClose render={<Button variant="outline" size="sm" />}>
            Cancelar
          </DialogClose>
          <Button size="sm" disabled={isPending || !teamId || !siteId} onClick={handleSubmit}>
            {isPending ? 'A guardar...' : isEdit ? 'Guardar' : 'Criar Alocação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
