'use client'

import { useState } from 'react'
import { Trash2, Users, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { WorkerActions } from './worker-actions'
import { deleteWorkers } from '@/lib/actions/workers'

type Worker = {
  id: string; nome: string; cargo: string | null
  telefone: string | null; data_admissao: string | null; ativo: boolean
}

type AtivoFilter = 'todos' | 'ativos' | 'inativos'

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-PT')
}

export function WorkersTable({ workers }: { workers: Worker[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [ativoFilter, setAtivoFilter] = useState<AtivoFilter>('todos')

  const filtered = workers.filter(w => {
    const q = search.toLowerCase()
    const matchSearch = !q || w.nome.toLowerCase().includes(q) || (w.cargo ?? '').toLowerCase().includes(q)
    const matchAtivo = ativoFilter === 'todos' || (ativoFilter === 'ativos' ? w.ativo : !w.ativo)
    return matchSearch && matchAtivo
  })

  const allSelected = filtered.length > 0 && filtered.every(w => selectedIds.has(w.id))
  const someSelected = selectedIds.size > 0

  function toggleAll() {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (allSelected) filtered.forEach(w => next.delete(w.id))
      else filtered.forEach(w => next.add(w.id))
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
          <span className="text-sm font-medium">{selectedIds.size} selecionado{selectedIds.size !== 1 ? 's' : ''}</span>
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
        description={`Apagar permanentemente ${selectedIds.size} trabalhador${selectedIds.size !== 1 ? 'es' : ''}? As suas alocações no calendário também serão eliminadas.`}
        onConfirm={async () => {
          const result = await deleteWorkers([...selectedIds])
          if (!result.error) setSelectedIds(new Set())
          return result
        }}
        successMessage={`${selectedIds.size} trabalhador${selectedIds.size !== 1 ? 'es' : ''} eliminado${selectedIds.size !== 1 ? 's' : ''}`}
      />

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou cargo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted/40 rounded-lg outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-1">
            {(['todos', 'ativos', 'inativos'] as AtivoFilter[]).map(f => (
              <button key={f} onClick={() => setAtivoFilter(f)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${ativoFilter === f ? 'bg-primary text-white' : 'bg-muted text-slate-500 hover:bg-muted/80'}`}>
                {f === 'todos' ? 'Todos' : f === 'ativos' ? 'Ativos' : 'Inativos'}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-100 border-b-2 border-slate-200">
            <tr>
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allSelected}
                  ref={el => { if (el) el.indeterminate = filtered.some(w => selectedIds.has(w.id)) && !allSelected }}
                  onChange={toggleAll} className="accent-primary cursor-pointer" />
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Nome</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden sm:table-cell">Cargo</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden md:table-cell">Telefone</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden lg:table-cell">Admissão</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <Users className="h-7 w-7 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {workers.length === 0 ? 'Sem trabalhadores registados' : 'Nenhum resultado encontrado'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {workers.length === 0 ? 'Adiciona manualmente ou importa um ficheiro CSV.' : 'Tenta ajustar a pesquisa ou os filtros.'}
                  </p>
                </td>
              </tr>
            )}
            {filtered.map(w => (
              <tr key={w.id} className={`hover:bg-muted/30 transition-colors ${!w.ativo ? 'opacity-50' : ''} ${selectedIds.has(w.id) ? 'bg-primary/5' : ''}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedIds.has(w.id)}
                    onChange={() => toggleOne(w.id)} className="accent-primary cursor-pointer" />
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{w.nome}</td>
                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{w.cargo ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{w.telefone ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{fmtDate(w.data_admissao)}</td>
                <td className="px-4 py-3">
                  <Badge variant={w.ativo ? 'default' : 'secondary'}>{w.ativo ? 'Ativo' : 'Inativo'}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <WorkerActions worker={w as any} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
