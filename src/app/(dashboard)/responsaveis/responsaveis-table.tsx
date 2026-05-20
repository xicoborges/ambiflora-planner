'use client'

import { useState, useTransition } from 'react'
import { Trash2, UserCog } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ResponsavelActions } from './responsavel-actions'
import { deleteResponsaveis } from '@/lib/actions/responsaveis'

type Responsavel = {
  id: string; nome: string; cargo: string | null
  telefone: string | null; ativo: boolean
}

export function ResponsaveisTable({ responsaveis }: { responsaveis: Responsavel[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const allSelected = responsaveis.length > 0 && selectedIds.size === responsaveis.length
  const someSelected = selectedIds.size > 0

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(responsaveis.map(r => r.id)))
  }

  function toggleOne(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleBulkDelete() {
    const count = selectedIds.size
    startTransition(async () => {
      const result = await deleteResponsaveis([...selectedIds])
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${count} responsável${count !== 1 ? 'is' : ''} eliminado${count !== 1 ? 's' : ''}`)
        setSelectedIds(new Set())
      }
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
          <Button variant="destructive" size="sm" disabled={isPending} onClick={handleBulkDelete} className="h-7 text-xs">
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            {isPending ? 'A eliminar...' : 'Eliminar'}
          </Button>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b">
            <tr>
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allSelected}
                  ref={el => { if (el) el.indeterminate = someSelected && !allSelected }}
                  onChange={toggleAll} className="accent-primary cursor-pointer" />
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden sm:table-cell">Cargo</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Telefone</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {responsaveis.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <UserCog className="h-7 w-7 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Sem responsáveis registados</p>
                  <p className="text-xs text-muted-foreground mt-1">Começa por adicionar o primeiro responsável.</p>
                </td>
              </tr>
            )}
            {responsaveis.map(r => (
              <tr key={r.id} className={`hover:bg-muted/30 transition-colors ${!r.ativo ? 'opacity-50' : ''} ${selectedIds.has(r.id) ? 'bg-primary/5' : ''}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedIds.has(r.id)}
                    onChange={() => toggleOne(r.id)} className="accent-primary cursor-pointer" />
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{r.nome}</td>
                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{r.cargo ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{r.telefone ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={r.ativo ? 'default' : 'secondary'}>{r.ativo ? 'Ativo' : 'Inativo'}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <ResponsavelActions responsavel={r} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
