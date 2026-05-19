'use client'

import { useState, useMemo, useTransition } from 'react'
import { AlertTriangle, Loader2, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { bulkCreateAssignments } from '@/lib/actions/assignments'
import type { Assignment } from './calendar-client'

const PERIODO_LABEL = { manha: 'Manhã', tarde: 'Tarde' }

function formatDatePT(d: string) {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function generatePeriods(
  startDate: string, startPeriodo: 'manha' | 'tarde',
  endDate: string, endPeriodo: 'manha' | 'tarde'
): { data: string; periodo: 'manha' | 'tarde' }[] {
  if (!startDate || !endDate) return []
  const result: { data: string; periodo: 'manha' | 'tarde' }[] = []
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  if (start > end) return result

  const cur = new Date(start)
  while (cur <= end) {
    const dateStr = cur.toISOString().split('T')[0]
    const isFirst = dateStr === startDate
    const isLast = dateStr === endDate
    const addManha = !isFirst || startPeriodo === 'manha'
    const addTarde = !isLast || endPeriodo === 'tarde'
    if (addManha) result.push({ data: dateStr, periodo: 'manha' })
    if (addTarde) result.push({ data: dateStr, periodo: 'tarde' })
    cur.setDate(cur.getDate() + 1)
  }
  return result
}

interface ConflictInfo {
  data: string
  periodo: 'manha' | 'tarde'
  existingSiteName: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  teams: { id: string; nome: string; cor: string }[]
  sites: { id: string; nome: string }[]
  equipment: { id: string; nome: string }[]
  existingAssignments: Assignment[]
}

export function BulkAssignmentModal({ open, onOpenChange, teams, sites, equipment, existingAssignments }: Props) {
  const today = new Date().toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(today)
  const [startPeriodo, setStartPeriodo] = useState<'manha' | 'tarde'>('manha')
  const [endDate, setEndDate] = useState(today)
  const [endPeriodo, setEndPeriodo] = useState<'manha' | 'tarde'>('tarde')
  const [teamId, setTeamId] = useState('')
  const [siteId, setSiteId] = useState('')
  const [notas, setNotas] = useState('')
  const [equipmentIds, setEquipmentIds] = useState<string[]>([])
  const [step, setStep] = useState<'form' | 'confirm'>('form')
  const [isPending, startTransition] = useTransition()

  function reset() {
    setStartDate(today)
    setStartPeriodo('manha')
    setEndDate(today)
    setEndPeriodo('tarde')
    setTeamId('')
    setSiteId('')
    setNotas('')
    setEquipmentIds([])
    setStep('form')
  }

  function handleOpenChange(o: boolean) {
    if (!o) reset()
    onOpenChange(o)
  }

  const periods = useMemo(
    () => generatePeriods(startDate, startPeriodo, endDate, endPeriodo),
    [startDate, startPeriodo, endDate, endPeriodo]
  )

  const conflicts: ConflictInfo[] = useMemo(() => {
    if (!teamId) return []
    return periods.flatMap(p => {
      const existing = existingAssignments.find(
        a => a.data === p.data && a.periodo === p.periodo && a.team_id === teamId
      )
      return existing ? [{ ...p, existingSiteName: existing.sites?.nome ?? '?' }] : []
    })
  }, [periods, teamId, existingAssignments])

  const periodsToCreate = useMemo(() => {
    const keys = new Set(conflicts.map(c => `${c.data}|${c.periodo}`))
    return periods.filter(p => !keys.has(`${p.data}|${p.periodo}`))
  }, [periods, conflicts])

  function toggleEquipment(id: string) {
    setEquipmentIds(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id])
  }

  function handleVerificar() {
    if (!teamId || !siteId) { toast.error('Escolhe a equipa e a obra'); return }
    if (periods.length === 0) { toast.error('O intervalo de datas não é válido'); return }
    if (conflicts.length > 0) { setStep('confirm'); return }
    doCreate()
  }

  function doCreate() {
    startTransition(async () => {
      const result = await bulkCreateAssignments(
        periodsToCreate.map(p => ({
          data: p.data,
          periodo: p.periodo,
          team_id: teamId,
          site_id: siteId,
          notas,
          equipment_ids: equipmentIds,
        }))
      )
      const n = result.created
      toast.success(`${n} alocaç${n === 1 ? 'ão criada' : 'ões criadas'}`)
      handleOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 'form' ? 'Nova Alocação por Intervalo' : 'Confirmar Criação'}
          </DialogTitle>
        </DialogHeader>

        {step === 'form' ? (
          <div className="space-y-3 py-1">
            {/* Intervalo */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Data de início</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Período</Label>
                <Select value={startPeriodo} onValueChange={v => setStartPeriodo((v ?? 'manha') as 'manha' | 'tarde')}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manha">Manhã</SelectItem>
                    <SelectItem value="tarde">Tarde</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Data de fim</Label>
                <Input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Período</Label>
                <Select value={endPeriodo} onValueChange={v => setEndPeriodo((v ?? 'tarde') as 'manha' | 'tarde')}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manha">Manhã</SelectItem>
                    <SelectItem value="tarde">Tarde</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Equipa */}
            <div className="space-y-1.5">
              <Label>Equipa *</Label>
              <Select value={teamId} onValueChange={v => setTeamId(v ?? '')}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Escolher equipa..." /></SelectTrigger>
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
            <div className="space-y-1.5">
              <Label>Obra *</Label>
              <Select value={siteId} onValueChange={v => setSiteId(v ?? '')}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Escolher obra..." /></SelectTrigger>
                <SelectContent>
                  {sites.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Equipamentos */}
            {equipment.length > 0 && (
              <div className="space-y-1.5">
                <Label>Equipamentos</Label>
                <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {equipment.map(eq => {
                    const checked = equipmentIds.includes(eq.id)
                    return (
                      <label key={eq.id} className={`flex items-center gap-2 text-sm rounded-md border px-2 py-1.5 cursor-pointer transition-colors ${checked ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-muted/50'}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleEquipment(eq.id)} className="accent-primary" />
                        <span className="truncate">{eq.nome}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Notas */}
            <div className="space-y-1.5">
              <Label>Notas</Label>
              <Textarea rows={2} value={notas} onChange={e => setNotas(e.target.value)} placeholder="Observações opcionais..." />
            </div>

            {/* Preview */}
            {periods.length > 0 && (
              <div className={`text-xs rounded-lg px-3 py-2 flex items-center gap-1.5 ${conflicts.length > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-primary/5 text-primary border border-primary/20'}`}>
                {conflicts.length > 0 && <AlertTriangle className="h-3.5 w-3.5 shrink-0" />}
                {periods.length} período{periods.length !== 1 ? 's' : ''} selecionado{periods.length !== 1 ? 's' : ''}
                {conflicts.length > 0 && ` · ${conflicts.length} conflito${conflicts.length !== 1 ? 's' : ''} · ${periodsToCreate.length} a criar`}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-1">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-medium text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {conflicts.length} conflito{conflicts.length !== 1 ? 's' : ''} detectado{conflicts.length !== 1 ? 's' : ''}
              </div>
              <ul className="space-y-1 max-h-44 overflow-y-auto">
                {conflicts.map(c => (
                  <li key={`${c.data}|${c.periodo}`} className="text-xs text-amber-700 flex items-center gap-1.5">
                    <span className="font-medium">{formatDatePT(c.data)} {PERIODO_LABEL[c.periodo]}</span>
                    <span className="text-amber-400">—</span>
                    <span>{c.existingSiteName}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-slate-600">
              Os conflitos serão ignorados. Serão criadas <strong>{periodsToCreate.length}</strong> de {periods.length} alocações.
            </p>
          </div>
        )}

        <DialogFooter>
          {step === 'form' ? (
            <>
              <DialogClose render={<Button variant="outline" size="sm" />}>Cancelar</DialogClose>
              <Button
                size="sm"
                disabled={isPending || !teamId || !siteId || periodsToCreate.length === 0}
                onClick={handleVerificar}
              >
                {isPending
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />A criar...</>
                  : conflicts.length > 0
                    ? `Ver conflitos (${periodsToCreate.length} a criar)`
                    : `Criar ${periods.length} alocaç${periods.length === 1 ? 'ão' : 'ões'}`}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setStep('form')} disabled={isPending}>
                <ChevronLeft className="h-4 w-4 mr-1" />Voltar
              </Button>
              <Button size="sm" disabled={isPending || periodsToCreate.length === 0} onClick={doCreate}>
                {isPending
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />A criar...</>
                  : `Criar ${periodsToCreate.length} alocaç${periodsToCreate.length === 1 ? 'ão' : 'ões'}`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
