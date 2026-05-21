'use client'

import { useState } from 'react'
import { Trash2, UsersRound, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog'
import { TeamActions } from './team-actions'
import { deleteTeams } from '@/lib/actions/teams'

type Team = {
  id: string
  nome: string
  cor: string
  notas: string | null
  ativo: boolean
  team_members: { worker_id: string }[]
}

export function TeamsTable({ teams }: { teams: Team[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = teams.filter(t =>
    !search || t.nome.toLowerCase().includes(search.toLowerCase())
  )

  const allSelected = filtered.length > 0 && filtered.every(t => selectedIds.has(t.id))
  const someSelected = selectedIds.size > 0

  function toggleAll() {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (allSelected) filtered.forEach(t => next.delete(t.id))
      else filtered.forEach(t => next.add(t.id))
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
        description={`Apagar permanentemente ${selectedIds.size} equipa${selectedIds.size !== 1 ? 's' : ''}? Todas as alocações associadas no calendário também serão eliminadas.`}
        onConfirm={async () => {
          const result = await deleteTeams([...selectedIds])
          if (!result.error) setSelectedIds(new Set())
          return result
        }}
        successMessage={`${selectedIds.size} equipa${selectedIds.size !== 1 ? 's' : ''} eliminada${selectedIds.size !== 1 ? 's' : ''}`}
      />

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b flex items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar por nome..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted/40 rounded-lg outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-100 border-b-2 border-slate-200">
            <tr>
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allSelected}
                  ref={el => { if (el) el.indeterminate = filtered.some(t => selectedIds.has(t.id)) && !allSelected }}
                  onChange={toggleAll} className="accent-primary cursor-pointer" />
              </th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Equipa</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Cor</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden sm:table-cell">Membros</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center">
                  <UsersRound className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {teams.length === 0 ? 'Nenhuma equipa criada.' : 'Nenhum resultado encontrado.'}
                  </p>
                  {teams.length === 0 && (
                    <p className="text-xs text-muted-foreground/70 mt-1">Cria equipas e atribui trabalhadores para as alocar no calendário.</p>
                  )}
                </td>
              </tr>
            )}
            {filtered.map(t => (
              <tr key={t.id} className={`hover:bg-muted/30 transition-colors ${!t.ativo ? 'opacity-50' : ''} ${selectedIds.has(t.id) ? 'bg-primary/5' : ''}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedIds.has(t.id)}
                    onChange={() => toggleOne(t.id)} className="accent-primary cursor-pointer" />
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{t.nome}</td>
                <td className="px-4 py-3">
                  <span className="inline-block h-4 w-4 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: t.cor }} />
                </td>
                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                  {t.team_members?.length ?? 0} membro{(t.team_members?.length ?? 0) !== 1 ? 's' : ''}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={t.ativo ? 'default' : 'secondary'}>
                    {t.ativo ? 'Ativa' : 'Inativa'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <TeamActions team={t as any} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
