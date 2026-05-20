'use client'

import { useState, useTransition } from 'react'
import { Trash2, Wrench } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EquipmentActions } from './equipment-actions'
import { deleteEquipmentBulk } from '@/lib/actions/equipment'

type Equipment = {
  id: string; nome: string; tipo: string | null
  numero_serie: string | null; ativo: boolean
}

export function EquipmentTable({ equipment }: { equipment: Equipment[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const allSelected = equipment.length > 0 && selectedIds.size === equipment.length
  const someSelected = selectedIds.size > 0

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(equipment.map(e => e.id)))
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
      const result = await deleteEquipmentBulk([...selectedIds])
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${count} equipamento${count !== 1 ? 's' : ''} eliminado${count !== 1 ? 's' : ''}`)
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
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden sm:table-cell">Tipo</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Nº de Série</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {equipment.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <Wrench className="h-7 w-7 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Sem equipamentos registados</p>
                  <p className="text-xs text-muted-foreground mt-1">Adiciona máquinas, veículos ou ferramentas utilizados nas obras.</p>
                </td>
              </tr>
            )}
            {equipment.map(e => (
              <tr key={e.id} className={`hover:bg-muted/30 transition-colors ${!e.ativo ? 'opacity-50' : ''} ${selectedIds.has(e.id) ? 'bg-primary/5' : ''}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedIds.has(e.id)}
                    onChange={() => toggleOne(e.id)} className="accent-primary cursor-pointer" />
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{e.nome}</td>
                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{e.tipo ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{e.numero_serie ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={e.ativo ? 'default' : 'secondary'}>{e.ativo ? 'Ativo' : 'Inativo'}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <EquipmentActions equipment={e as any} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
