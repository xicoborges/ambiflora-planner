'use client'

import { useState } from 'react'
import { Trash2, UserCog, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { ResponsavelActions } from './responsavel-actions'
import { deleteResponsaveis } from '@/lib/actions/responsaveis'

type Responsavel = {
  id: string; nome: string; cargo: string | null
  telefone: string | null; data_admissao: string | null; ativo: boolean
}

type AtivoFilter = 'todos' | 'ativos' | 'inativos'

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-PT')
}

export function ResponsaveisTable({ responsaveis }: { responsaveis: Responsavel[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [ativoFilter, setAtivoFilter] = useState<AtivoFilter>('todos')

  const filtered = responsaveis.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q || r.nome.toLowerCase().includes(q) || (r.cargo ?? '').toLowerCase().includes(q)
    const matchAtivo = ativoFilter === 'todos' || (ativoFilter === 'ativos' ? r.ativo : !r.ativo)
    return matchSearch && matchAtivo
  })

  const allSelected = filtered.length > 0 && filtered.every(r => selectedIds.has(r.id))
  const someSelected = selectedIds.size > 0

  function toggleAll() {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (allSelected) filtered.forEach(r => next.delete(r.id))
      else filtered.forEach(r => next.add(r.id))
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
        description={`Apagar permanentemente ${selectedIds.size} responsável${selectedIds.size !== 1 ? 'is' : ''}? Serão desassociados das obras a que pertencem.`}
        onConfirm={async () => {
          const result = await deleteResponsaveis([...selectedIds])
          if (!result.error) setSelectedIds(new Set())
          return result
        }}
        successMessage={`${selectedIds.size} responsável${selectedIds.size !== 1 ? 'is' : ''} eliminado${selectedIds.size !== 1 ? 's' : ''}`}
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
                  ref={el => { if (el) el.indeterminate = filtered.some(r => selectedIds.has(r.id)) && !allSelected }}
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
                    <UserCog className="h-7 w-7 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {responsaveis.length === 0 ? 'Sem responsáveis registados' : 'Nenhum resultado encontrado'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {responsaveis.length === 0 ? 'Começa por adicionar o primeiro responsável.' : 'Tenta ajustar a pesquisa ou os filtros.'}
                  </p>
                </td>
              </tr>
            )}
            {filtered.map(r => (
              <tr key={r.id} className={`hover:bg-muted/30 transition-colors ${!r.ativo ? 'opacity-50' : ''} ${selectedIds.has(r.id) ? 'bg-primary/5' : ''}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedIds.has(r.id)}
                    onChange={() => toggleOne(r.id)} className="accent-primary cursor-pointer" />
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{r.nome}</td>
                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{r.cargo ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{r.telefone ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{fmtDate(r.data_admissao)}</td>
                <td className="px-4 py-3">
                  <Badge variant={r.ativo ? 'default' : 'secondary'}>{r.ativo ? 'Ativo' : 'Inativo'}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <ResponsavelActions responsavel={r as any} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
