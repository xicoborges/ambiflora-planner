'use client'

import { useState, useTransition } from 'react'
import { Trash2, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
  const [isPending, startTransition] = useTransition()

  const allSelected = sites.length > 0 && selectedIds.size === sites.length
  const someSelected = selectedIds.size > 0

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(sites.map(s => s.id)))
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
      const result = await deleteSites([...selectedIds])
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${count} obra${count !== 1 ? 's' : ''} eliminada${count !== 1 ? 's' : ''}`)
        setSelectedIds(new Set())
      }
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
          <Button variant="destructive" size="sm" disabled={isPending} onClick={handleBulkDelete} className="h-7 text-xs">
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            {isPending ? 'A eliminar...' : 'Eliminar'}
          </Button>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b">
            <tr>
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allSelected}
                  ref={el => { if (el) el.indeterminate = someSelected && !allSelected }}
                  onChange={toggleAll} className="accent-primary cursor-pointer" />
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden sm:table-cell">Cliente</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Local</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden lg:table-cell">Início</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden lg:table-cell">Fim</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden xl:table-cell">Valor Esperado</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden xl:table-cell">Responsável</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sites.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-14 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <MapPin className="h-7 w-7 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Sem obras registadas</p>
                  <p className="text-xs text-muted-foreground mt-1">Adiciona as obras onde as equipas vão ser alocadas.</p>
                </td>
              </tr>
            )}
            {sites.map(s => (
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
