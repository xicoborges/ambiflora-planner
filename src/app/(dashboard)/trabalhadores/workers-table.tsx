'use client'

import { useState, useTransition } from 'react'
import { Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WorkerActions } from './worker-actions'
import { deleteWorkers } from '@/lib/actions/workers'

type Worker = {
  id: string; nome: string; cargo: string | null
  telefone: string | null; ativo: boolean
}

export function WorkersTable({ workers }: { workers: Worker[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const allSelected = workers.length > 0 && selectedIds.size === workers.length
  const someSelected = selectedIds.size > 0

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(workers.map(w => w.id)))
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
      const result = await deleteWorkers([...selectedIds])
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${count} trabalhador${count !== 1 ? 'es' : ''} eliminado${count !== 1 ? 's' : ''}`)
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
            {workers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <Users className="h-7 w-7 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Sem trabalhadores registados</p>
                  <p className="text-xs text-muted-foreground mt-1">Adiciona manualmente ou importa um ficheiro CSV.</p>
                </td>
              </tr>
            )}
            {workers.map(w => (
              <tr key={w.id} className={`hover:bg-muted/30 transition-colors ${!w.ativo ? 'opacity-50' : ''} ${selectedIds.has(w.id) ? 'bg-primary/5' : ''}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedIds.has(w.id)}
                    onChange={() => toggleOne(w.id)} className="accent-primary cursor-pointer" />
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{w.nome}</td>
                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{w.cargo ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{w.telefone ?? '—'}</td>
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
