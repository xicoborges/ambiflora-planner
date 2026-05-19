'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Filter, CalendarRange } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { AssignmentModal } from './assignment-modal'
import { BulkAssignmentModal } from './bulk-assignment-modal'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DIAS_SEMANA = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']

export type Assignment = {
  id: string
  data: string
  periodo: 'manha' | 'tarde'
  team_id: string
  site_id: string
  notas: string | null
  teams: { id: string; nome: string; cor: string } | null
  sites: { id: string; nome: string } | null
  assignment_equipment: { equipment_id: string }[]
}

export type SelectedCell = {
  data: string
  periodo: 'manha' | 'tarde'
}

interface Props {
  ano: number
  mes: number
  assignments: Assignment[]
  teams: { id: string; nome: string; cor: string }[]
  sites: { id: string; nome: string }[]
  workers: { id: string; nome: string }[]
  equipment: { id: string; nome: string }[]
  teamMembers: { team_id: string; worker_id: string }[]
}

export function CalendarClient({ ano, mes, assignments, teams, sites, workers, equipment, teamMembers }: Props) {
  const router = useRouter()
  const [filterTeam, setFilterTeam] = useState<string>('')
  const [filterSite, setFilterSite] = useState<string>('')
  const [filterWorker, setFilterWorker] = useState<string>('')
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [bulkModalOpen, setBulkModalOpen] = useState(false)

  // Real-time: refresh page data when DB changes
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('calendar-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignment_equipment' }, () => router.refresh())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [router])

  // Worker→teams mapping for filter
  const workerTeams = useMemo(() => {
    const map: Record<string, Set<string>> = {}
    teamMembers.forEach(({ worker_id, team_id }) => {
      if (!map[worker_id]) map[worker_id] = new Set()
      map[worker_id].add(team_id)
    })
    return map
  }, [teamMembers])

  // Filter assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => {
      if (filterTeam && a.team_id !== filterTeam) return false
      if (filterSite && a.site_id !== filterSite) return false
      if (filterWorker) {
        const workerTeamIds = workerTeams[filterWorker] ?? new Set()
        if (!workerTeamIds.has(a.team_id)) return false
      }
      return true
    })
  }, [assignments, filterTeam, filterSite, filterWorker, workerTeams])

  // Build calendar grid: array of weeks, each with 7 days (null = padding)
  const weeks = useMemo(() => {
    const firstDay = new Date(ano, mes - 1, 1)
    const lastDay = new Date(ano, mes, 0)
    const startOffset = (firstDay.getDay() + 6) % 7 // Mon=0
    const days: (number | null)[] = [
      ...Array(startOffset).fill(null),
      ...Array.from({ length: lastDay.getDate() }, (_, i) => i + 1),
    ]
    while (days.length % 7 !== 0) days.push(null)
    const result: (number | null)[][] = []
    for (let i = 0; i < days.length; i += 7) result.push(days.slice(i, i + 7))
    return result
  }, [ano, mes])

  function navigate(delta: number) {
    let newMes = mes + delta
    let newAno = ano
    if (newMes < 1) { newMes = 12; newAno-- }
    if (newMes > 12) { newMes = 1; newAno++ }
    router.push(`/calendario?ano=${newAno}&mes=${newMes}`)
  }

  function getDateString(day: number) {
    return `${ano}-${String(mes).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function getCellAssignments(day: number, periodo: 'manha' | 'tarde') {
    const dateStr = getDateString(day)
    return filteredAssignments.filter(a => a.data === dateStr && a.periodo === periodo)
  }

  function openCreate(day: number, periodo: 'manha' | 'tarde') {
    setSelectedCell({ data: getDateString(day), periodo })
    setSelectedAssignment(null)
    setModalOpen(true)
  }

  function openEdit(assignment: Assignment) {
    setSelectedCell({ data: assignment.data, periodo: assignment.periodo })
    setSelectedAssignment(assignment)
    setModalOpen(true)
  }

  const today = new Date()
  const isToday = (day: number) =>
    day === today.getDate() && mes === today.getMonth() + 1 && ano === today.getFullYear()

  const hasActiveFilter = filterTeam || filterSite || filterWorker

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xl font-bold text-slate-900 min-w-[190px] text-center capitalize">
            {MESES[mes - 1]} {ano}
          </span>
          <Button variant="ghost" size="icon" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={() => {
          const n = new Date()
          router.push(`/calendario?ano=${n.getFullYear()}&mes=${n.getMonth() + 1}`)
        }}>
          Hoje
        </Button>
        <Button size="sm" onClick={() => setBulkModalOpen(true)}>
          <CalendarRange className="h-4 w-4 mr-1.5" />
          Nova Alocação
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 bg-white rounded-xl border shadow-sm px-3 py-2">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select value={filterTeam || ''} onValueChange={(v) => setFilterTeam(v ?? '')}>
          <SelectTrigger className="w-40 h-7 text-xs">
            <SelectValue placeholder="Equipa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as equipas</SelectItem>
            {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterSite || ''} onValueChange={(v) => setFilterSite(v ?? '')}>
          <SelectTrigger className="w-40 h-7 text-xs">
            <SelectValue placeholder="Obra" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as obras</SelectItem>
            {sites.map(s => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterWorker || ''} onValueChange={(v) => setFilterWorker(v ?? '')}>
          <SelectTrigger className="w-40 h-7 text-xs">
            <SelectValue placeholder="Trabalhador" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os trabalhadores</SelectItem>
            {workers.map(w => <SelectItem key={w.id} value={w.id}>{w.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        {hasActiveFilter && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => {
            setFilterTeam(''); setFilterSite(''); setFilterWorker('')
          }}>
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Grelha */}
      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <div className="min-w-[700px]">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 border-b bg-muted/40">
            {DIAS_SEMANA.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-slate-500 py-2.5 uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>

          {/* Semanas */}
          {weeks.map((week, wi) => (
            <div key={wi} className={cn('grid grid-cols-7', wi < weeks.length - 1 && 'border-b')}>
              {week.map((day, di) => (
                <div
                  key={di}
                  className={cn(
                    'border-r last:border-r-0 min-h-[90px]',
                    !day && 'bg-gray-50/50'
                  )}
                >
                  {day && (
                    <>
                      <div className={cn(
                        'text-xs font-medium px-2 pt-1.5 pb-0.5',
                        isToday(day)
                          ? 'text-white bg-primary rounded-full w-6 h-6 flex items-center justify-center mx-1.5 mt-1.5'
                          : 'text-slate-400'
                      )}>
                        {day}
                      </div>
                      {(['manha', 'tarde'] as const).map(periodo => {
                        const cellAssignments = getCellAssignments(day, periodo)
                        return (
                          <div
                            key={periodo}
                            className="px-1.5 pb-1.5 cursor-pointer group"
                            onClick={() => openCreate(day, periodo)}
                          >
                            <div className="text-[10px] text-slate-300 font-semibold mb-0.5 flex items-center gap-1 uppercase tracking-wider">
                              {periodo === 'manha' ? 'Manhã' : 'Tarde'}
                              <span className="opacity-0 group-hover:opacity-100 text-primary transition-opacity text-base leading-none">+</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              {cellAssignments.map(a => (
                                <button
                                  key={a.id}
                                  onClick={e => { e.stopPropagation(); openEdit(a) }}
                                  className="w-full text-left text-[10px] font-medium rounded px-1 py-0.5 truncate text-white hover:opacity-80 transition-opacity"
                                  style={{ backgroundColor: a.teams?.cor ?? '#6B7280' }}
                                  title={`${a.teams?.nome} — ${a.sites?.nome}`}
                                >
                                  {a.teams?.nome}
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legenda */}
      {teams.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-1 px-1">
          {teams.map(t => (
            <span key={t.id} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-3 w-3 rounded-full inline-block border border-black/10" style={{ backgroundColor: t.cor }} />
              {t.nome}
            </span>
          ))}
        </div>
      )}

      {/* Modal de intervalo */}
      <BulkAssignmentModal
        open={bulkModalOpen}
        onOpenChange={setBulkModalOpen}
        teams={teams}
        sites={sites}
        equipment={equipment}
        existingAssignments={assignments}
      />

      {/* Modal de célula */}
      <AssignmentModal
        open={modalOpen}
        onOpenChange={(o) => { setModalOpen(o); if (!o) { setSelectedCell(null); setSelectedAssignment(null) } }}
        selectedCell={selectedCell}
        selectedAssignment={selectedAssignment}
        teams={teams}
        sites={sites}
        equipment={equipment}
        existingAssignments={assignments}
      />
    </div>
  )
}
