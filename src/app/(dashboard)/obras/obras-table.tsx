'use client'

import { useState } from 'react'
import { Trash2, MapPin, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { SiteActions } from './site-actions'
import { deleteSites } from '@/lib/actions/sites'

type Site = {
  id: string; nome: string; cliente: string | null
  morada: string | null; data_inicio: string | null
  data_fim_prevista: string | null; valor: number | null
  estado: string; responsaveis: { nome: string } | null
}

const estadoLabel: Record<string, string> = {
  por_comecar: 'Por Começar',
  em_curso: 'Em Curso',
  pausada: 'Em Pausa',
  concluida: 'Concluída',
}

const estadoClass: Record<string, string> = {
  por_comecar: 'bg-slate-100 text-slate-500 border border-slate-200',
  em_curso: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  pausada: 'bg-amber-50 text-amber-700 border border-amber-200',
  concluida: 'bg-sky-50 text-sky-700 border border-sky-200',
}

const estadoFilterOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'em_curso', label: 'Em Curso' },
  { value: 'por_comecar', label: 'Por Começar' },
  { value: 'pausada', label: 'Em Pausa' },
  { value: 'concluida', label: 'Concluída' },
]

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-PT')
}

function fmtEuros(v: number | null) {
  if (v == null) return '—'
  return v.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}

export function ObrasTable({ sites }: { sites: Site[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('todos')

  const filtered = sites.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = !q || s.nome.toLowerCase().includes(q) || (s.cliente ?? '').toLowerCase().includes(q)
    const matchEstado = estadoFilter === 'todos' || s.estado === estadoFilter
    return matchSearch && matchEstado
  })

  const allSelected = filtered.length > 0 && filtered.every(s => selectedIds.has(s.id))
  const someSelected = selectedIds.size > 0

  function toggleAll() {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (allSelected) filtered.forEach(s => next.delete(s.id))
      else filtered.forEach(s => next.add(s.id))
      return next
    })
  }

  function toggleOne(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }


  return (
    <div className="space-y-3">
      {someSelected && (
        <div className="flex items-center gap-3 bg-slate-900 text-white rounded-xl px-4 py-2.5 shadow-md">
          <span className="text-sm font-medium">{selectedIds.size} selecionada{selectedIds.size !== 1 ? 's' : ''}</span>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}
            className="text-slate-300 hover:text-white hover:bg-white/10 h-7 text-xs">
            Cancelar
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)} className="h-7 text-xs">
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Eliminar
          </Button>
        </div>
      )}

      <ConfirmDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        description={`Apagar permanentemente ${selectedIds.size} obra${selectedIds.size !== 1 ? 's' : ''}? Todas as alocações associadas no calendário também serão eliminadas.`}
        onConfirm={async () => {
          const result = await deleteSites([...selectedIds])
          if (!result.error) setSelectedIds(new Set())
          return result
        }}
        successMessage={`${selectedIds.size} obra${selectedIds.size !== 1 ? 's' : ''} eliminada${selectedIds.size !== 1 ? 's' : ''}`}
      />

      <div className="bg-white rounded-xl border overflow-x-auto shadow-sm">
        <div className="px-4 py-3 border-b flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted/40 rounded-lg outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {estadoFilterOptions.map(opt => (
              <button key={opt.value} onClick={() => setEstadoFilter(opt.value)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${estadoFilter === opt.value ? 'bg-primary text-white' : 'bg-muted text-slate-500 hover:bg-muted/80'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-100 border-b-2 border-slate-200">
            <tr>
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allSelected}
                  ref={el => { if (el) el.indeterminate = filtered.some(s => selectedIds.has(s.id)) && !allSelected }}
                  onChange={toggleAll} className="accent-primary cursor-pointer" />
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Nome</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden sm:table-cell">Cliente</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden md:table-cell">Local</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden lg:table-cell">Início</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden lg:table-cell">Fim</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden xl:table-cell">Valor Esperado</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden xl:table-cell">Responsável</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-14 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <MapPin className="h-7 w-7 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {sites.length === 0 ? 'Sem obras registadas' : 'Nenhum resultado encontrado'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {sites.length === 0 ? 'Adiciona as obras onde as equipas vão ser alocadas.' : 'Tenta ajustar a pesquisa ou os filtros.'}
                  </p>
                </td>
              </tr>
            )}
            {filtered.map(s => (
              <tr key={s.id} className={`hover:bg-muted/30 transition-colors ${selectedIds.has(s.id) ? 'bg-primary/5' : ''}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedIds.has(s.id)}
                    onChange={() => toggleOne(s.id)} className="accent-primary cursor-pointer" />
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{s.nome}</td>
                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{s.cliente ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{s.morada ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{fmtDate(s.data_inicio)}</td>
                <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{fmtDate(s.data_fim_prevista)}</td>
                <td className="px-4 py-3 text-slate-500 hidden xl:table-cell">{fmtEuros(s.valor)}</td>
                <td className="px-4 py-3 text-slate-500 hidden xl:table-cell">{s.responsaveis?.nome ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${estadoClass[s.estado]}`}>
                    {estadoLabel[s.estado]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <SiteActions site={s as any} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
