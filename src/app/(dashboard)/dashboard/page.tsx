import Link from 'next/link'
import { AlertTriangle, Users, Wrench, MapPin, CalendarDays, Clock, CheckCircle2, PauseCircle, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

type SiteRow = {
  id: string; nome: string; cliente: string | null; estado: string
  data_fim_prevista: string | null
  responsaveis: { nome: string } | null
}

type AssignmentRow = {
  id: string; data: string; periodo: 'manha' | 'tarde'
  team_id: string | null; worker_id: string | null; site_id: string
  teams: { nome: string; cor: string } | null
  workers: { nome: string } | null
  sites: { nome: string } | null
  assignment_equipment: { equipment_id: string }[]
}

function todayPT(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(new Date())
}

function getWeekRange(today: string) {
  const [y, m, d] = today.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const dow = date.getDay()
  const offset = dow === 0 ? -6 : 1 - dow
  const monday = new Date(y, m - 1, d + offset)
  const sunday = new Date(y, m - 1, d + offset + 6)
  const fmt = (dt: Date) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
  return { weekStart: fmt(monday), weekEnd: fmt(sunday) }
}

function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d + n)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

function fmtDate(s: string | null): string {
  if (!s) return '—'
  const [y, m, d] = s.split('-')
  return `${d}/${m}/${y}`
}

function daysUntil(dateStr: string, today: string): number {
  const [ty, tm, td] = today.split('-').map(Number)
  const [fy, fm, fd] = dateStr.split('-').map(Number)
  return Math.round((new Date(fy, fm - 1, fd).getTime() - new Date(ty, tm - 1, td).getTime()) / 86400000)
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-2">
      <div className="h-full rounded-full bg-current transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const today = todayPT()
  const { weekStart, weekEnd } = getWeekRange(today)

  const [
    { data: workers },
    { data: equipment },
    { data: teams },
    sitesRes,
    todayRes,
    { data: weekAssignments },
  ] = await Promise.all([
    supabase.from('workers').select('id, ativo'),
    supabase.from('equipment').select('id, ativo'),
    supabase.from('teams').select('id, ativo'),
    supabase.from('sites').select('id, nome, cliente, estado, data_fim_prevista, responsaveis(nome)') as any,
    supabase.from('assignments')
      .select('id, data, periodo, team_id, worker_id, site_id, teams(nome, cor), workers(nome), sites(nome), assignment_equipment(equipment_id)')
      .eq('data', today) as any,
    supabase.from('assignments')
      .select('data, team_id, worker_id, site_id')
      .gte('data', weekStart)
      .lte('data', weekEnd),
  ])

  const todayAssignments: AssignmentRow[] = todayRes.data ?? []
  const sites: SiteRow[] = sitesRes.data ?? []

  // Workers in obra today via teams
  const todayTeamIds = [...new Set(todayAssignments.filter(a => a.team_id).map(a => a.team_id!))]
  const { data: teamMembersToday } = todayTeamIds.length > 0
    ? await supabase.from('team_members').select('worker_id').in('team_id', todayTeamIds)
        .or(`data_fim.is.null,data_fim.gte.${today}`)
    : { data: [] }

  const workersViaTeams = new Set((teamMembersToday ?? []).map(m => m.worker_id))
  const directWorkers = new Set(todayAssignments.filter(a => a.worker_id).map(a => a.worker_id!))
  const allWorkersToday = new Set([...workersViaTeams, ...directWorkers])

  const equipInUseToday = new Set(
    todayAssignments.flatMap(a => a.assignment_equipment.map(e => e.equipment_id))
  )

  const activeWorkers = (workers ?? []).filter(w => w.ativo)
  const activeEquipment = (equipment ?? []).filter(e => e.ativo)

  const emCurso = sites.filter(s => s.estado === 'em_curso')
  const porComecar = sites.filter(s => s.estado === 'por_comecar')
  const emPausa = sites.filter(s => s.estado === 'pausada')
  const concluidas = sites.filter(s => s.estado === 'concluida')

  const thirtyDaysLater = addDays(today, 30)
  const obrasExcedidas = emCurso.filter(s => s.data_fim_prevista && s.data_fim_prevista < today)
  const obrasAVencer = emCurso.filter(s =>
    s.data_fim_prevista && s.data_fim_prevista >= today && s.data_fim_prevista <= thirtyDaysLater
  ).sort((a, b) => (a.data_fim_prevista ?? '').localeCompare(b.data_fim_prevista ?? ''))

  // Week data
  const weekDaysArr = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const assignsByDay: Record<string, number> = {}
  weekDaysArr.forEach(d => { assignsByDay[d] = 0 })
  ;(weekAssignments ?? []).forEach((a: any) => { if (assignsByDay[a.data] !== undefined) assignsByDay[a.data]++ })
  const maxDayCount = Math.max(...Object.values(assignsByDay), 1)

  const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

  const manhaAssignments = todayAssignments.filter(a => a.periodo === 'manha')
  const tardeAssignments = todayAssignments.filter(a => a.periodo === 'tarde')

  const hour = parseInt(
    new Intl.DateTimeFormat('pt-PT', { hour: 'numeric', hour12: false, timeZone: 'Europe/Lisbon' }).format(new Date())
  )
  const greeting = hour < 12 ? 'Bom dia' : hour < 19 ? 'Boa tarde' : 'Boa noite'

  const dateLabel = new Intl.DateTimeFormat('pt-PT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'Europe/Lisbon',
  }).format(new Date())
  const dateLabelCapitalized = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)

  const totalAlertas = obrasExcedidas.length + obrasAVencer.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{greeting}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{dateLabelCapitalized}</p>
      </div>

      {/* Alertas */}
      {totalAlertas > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-800 font-medium text-sm">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {totalAlertas} alerta{totalAlertas !== 1 ? 's' : ''} de prazo
          </div>
          {obrasExcedidas.map(s => (
            <div key={s.id} className="flex items-center gap-2 text-xs text-amber-700 pl-6">
              <span className="font-semibold text-red-600">Prazo excedido</span>
              <span className="text-slate-400">·</span>
              <Link href="/obras" className="font-medium hover:underline">{s.nome}</Link>
              {s.data_fim_prevista && (
                <span className="text-muted-foreground">({Math.abs(daysUntil(s.data_fim_prevista, today))} dias em atraso)</span>
              )}
            </div>
          ))}
          {obrasAVencer.map(s => {
            const days = daysUntil(s.data_fim_prevista!, today)
            return (
              <div key={s.id} className="flex items-center gap-2 text-xs text-amber-700 pl-6">
                <span className="font-semibold">Vence em {days} dia{days !== 1 ? 's' : ''}</span>
                <span className="text-slate-400">·</span>
                <Link href="/obras" className="font-medium hover:underline">{s.nome}</Link>
                {s.cliente && <span className="text-muted-foreground">({s.cliente})</span>}
              </div>
            )
          })}
        </div>
      )}

      {/* KPIs — Hoje */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Hoje</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-4xl font-bold text-slate-900 tracking-tight">{todayAssignments.length}</p>
            <p className="text-sm font-medium text-slate-600 mt-0.5">Alocações</p>
            <p className="text-xs text-muted-foreground mt-1">Manhã: {manhaAssignments.length} · Tarde: {tardeAssignments.length}</p>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-slate-900 tracking-tight">
              {new Set(todayAssignments.map(a => a.site_id)).size}
            </p>
            <p className="text-sm font-medium text-slate-600 mt-0.5">Obras Ativas Hoje</p>
            <p className="text-xs text-muted-foreground mt-1">{emCurso.length} em curso no total</p>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-violet-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-slate-900 tracking-tight">{allWorkersToday.size}</p>
            <p className="text-sm font-medium text-slate-600 mt-0.5">Trabalhadores em Obra</p>
            <p className="text-xs text-muted-foreground mt-1">
              {activeWorkers.length - allWorkersToday.size} de {activeWorkers.length} disponíveis
            </p>
            <ProgressBar value={allWorkersToday.size} max={activeWorkers.length} />
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-slate-900 tracking-tight">{equipInUseToday.size}</p>
            <p className="text-sm font-medium text-slate-600 mt-0.5">Equipamentos em Uso</p>
            <p className="text-xs text-muted-foreground mt-1">
              {activeEquipment.length - equipInUseToday.size} de {activeEquipment.length} disponíveis
            </p>
            <ProgressBar value={equipInUseToday.size} max={activeEquipment.length} />
          </div>
        </div>
      </div>

      {/* Estado das Obras */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Estado das Obras</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/obras" className="bg-white border border-emerald-200 rounded-xl p-5 hover:bg-emerald-50 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-emerald-700 tracking-tight">{emCurso.length}</p>
            <p className="text-sm font-medium text-emerald-600 mt-0.5">Em Curso</p>
          </Link>
          <Link href="/obras" className="bg-white border border-slate-200 rounded-xl p-5 hover:bg-slate-50 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-slate-500" />
              </div>
            </div>
            <p className="text-4xl font-bold text-slate-700 tracking-tight">{porComecar.length}</p>
            <p className="text-sm font-medium text-slate-500 mt-0.5">Por Começar</p>
          </Link>
          <Link href="/obras" className="bg-white border border-amber-200 rounded-xl p-5 hover:bg-amber-50 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <PauseCircle className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-amber-700 tracking-tight">{emPausa.length}</p>
            <p className="text-sm font-medium text-amber-600 mt-0.5">Em Pausa</p>
          </Link>
          <Link href="/obras" className="bg-white border border-sky-200 rounded-xl p-5 hover:bg-sky-50 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-sky-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-sky-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-sky-700 tracking-tight">{concluidas.length}</p>
            <p className="text-sm font-medium text-sky-600 mt-0.5">Concluídas</p>
          </Link>
        </div>
      </div>

      {/* Esta Semana */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Esta Semana</h2>
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <div className="flex items-end justify-around gap-1 h-20">
            {weekDaysArr.map((day, i) => {
              const count = assignsByDay[day] ?? 0
              const barHeight = maxDayCount > 0 ? Math.max(Math.round((count / maxDayCount) * 56), count > 0 ? 4 : 0) : 0
              const isToday = day === today
              const dayNum = day.split('-')[2]
              return (
                <div key={day} className="flex flex-col items-center gap-1 flex-1">
                  <span className={`text-[11px] font-medium ${isToday ? 'text-primary' : 'text-slate-400'}`}>
                    {count > 0 ? count : ''}
                  </span>
                  <div className="w-full max-w-8 flex items-end justify-center" style={{ height: '56px' }}>
                    <div
                      className={`w-full rounded-t transition-all ${isToday ? 'bg-primary' : 'bg-primary/30'}`}
                      style={{ height: `${barHeight}px` }}
                    />
                  </div>
                  <span className={`text-[11px] font-semibold ${isToday ? 'text-primary' : 'text-slate-500'}`}>{DIAS_SEMANA[i]}</span>
                  <span className={`text-[11px] ${isToday ? 'text-primary font-medium' : 'text-slate-400'}`}>{dayNum}</span>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {(weekAssignments ?? []).length} alocação{(weekAssignments ?? []).length !== 1 ? 'ões' : ''} esta semana
          </p>
        </div>
      </div>

      {/* Agenda de Hoje + Obras em Curso */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Agenda de Hoje */}
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h3 className="font-semibold text-sm text-slate-900">Agenda de Hoje</h3>
            <Link href="/calendario" className="text-xs text-primary hover:underline">Ver calendário →</Link>
          </div>
          {todayAssignments.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma alocação para hoje.
            </div>
          ) : (
            <div className="divide-y">
              {(['manha', 'tarde'] as const).map(periodo => {
                const list = todayAssignments.filter(a => a.periodo === periodo)
                if (list.length === 0) return null
                return (
                  <div key={periodo} className="px-4 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      {periodo === 'manha' ? 'Manhã' : 'Tarde'}
                    </p>
                    <div className="space-y-1">
                      {list.map(a => (
                        <div key={a.id} className="flex items-center gap-2 text-sm">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: a.teams?.cor ?? '#94a3b8' }}
                          />
                          <span className="font-medium text-slate-800 truncate">
                            {a.teams?.nome ?? a.workers?.nome ?? '—'}
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className="text-slate-600 truncate">{a.sites?.nome ?? '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Obras em Curso */}
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h3 className="font-semibold text-sm text-slate-900">Obras em Curso</h3>
            <Link href="/obras" className="text-xs text-primary hover:underline">Ver todas →</Link>
          </div>
          {emCurso.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma obra em curso.
            </div>
          ) : (
            <div className="divide-y max-h-64 overflow-y-auto">
              {emCurso.map(s => {
                const days = s.data_fim_prevista ? daysUntil(s.data_fim_prevista, today) : null
                const isLate = days !== null && days < 0
                const isSoon = days !== null && days >= 0 && days <= 14
                return (
                  <div key={s.id} className="px-4 py-2.5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{s.nome}</p>
                      {s.cliente && <p className="text-xs text-muted-foreground truncate">{s.cliente}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      {s.data_fim_prevista ? (
                        <span className={`text-xs font-medium ${isLate ? 'text-red-600' : isSoon ? 'text-amber-600' : 'text-slate-500'}`}>
                          {isLate ? `⚠ ${Math.abs(days!)}d atraso` : `${fmtDate(s.data_fim_prevista)}`}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">Sem prazo</span>
                      )}
                      {s.responsaveis?.nome && (
                        <p className="text-[11px] text-muted-foreground">{s.responsaveis.nome}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
