'use client'

import { useState, useTransition } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { gerarRelatorio, exportarExcel } from './actions'

interface Props {
  workers: { id: string; nome: string }[]
  teams: { id: string; nome: string; cor: string }[]
  sites: { id: string; nome: string; cliente: string | null }[]
  equipment: { id: string; nome: string }[]
}

export type RelatorioData = {
  porTrabalhador: {
    worker_id: string
    nome: string
    diasTrabalhados: number
    obras: string[]
    equipas: string[]
  }[]
  porObra: {
    site_id: string
    nome: string
    cliente: string | null
    diasAlocados: number
    equipas: string[]
    equipamentos: string[]
  }[]
  porEquipamento: {
    equipment_id: string
    nome: string
    diasUsado: number
    obras: string[]
  }[]
}

const hoje = new Date()
const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

function toInputDate(d: Date) {
  return d.toISOString().split('T')[0]
}

export function RelatoriosClient({ workers, teams, sites, equipment }: Props) {
  const [dataInicio, setDataInicio] = useState(toInputDate(primeiroDiaMes))
  const [dataFim, setDataFim] = useState(toInputDate(hoje))
  const [dados, setDados] = useState<RelatorioData | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isExporting, startExport] = useTransition()

  function handleGerar() {
    startTransition(async () => {
      const result = await gerarRelatorio(dataInicio, dataFim)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        setDados(result)
      }
    })
  }

  function handleExport() {
    if (!dados) return
    startExport(async () => {
      const result = await exportarExcel(dataInicio, dataFim)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      // Descarregar o ficheiro Excel gerado
      const bytes = new Uint8Array(result.buffer)
      const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio_${dataInicio}_${dataFim}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Relatórios</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Resumo de actividade por período</p>
        </div>
        {dados && (
          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            {isExporting
              ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              : <FileDown className="h-4 w-4 mr-2" />}
            Exportar Excel
          </Button>
        )}
      </div>

      {/* Seletor de período */}
      <div className="bg-white rounded-xl border shadow-sm p-4 flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="data_inicio">Data de início</Label>
          <Input id="data_inicio" type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="w-40" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="data_fim">Data de fim</Label>
          <Input id="data_fim" type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="w-40" />
        </div>
        <Button onClick={handleGerar} disabled={isPending}>
          {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />A gerar...</> : 'Gerar Relatório'}
        </Button>
      </div>

      {dados && (
        <div className="space-y-6">
          {/* Por Trabalhador */}
          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-2 px-0.5">Por Trabalhador</h2>
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500 text-xs uppercase tracking-wide">Nome</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500 text-xs uppercase tracking-wide">Dias</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Obras</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500 text-xs uppercase tracking-wide hidden lg:table-cell">Equipas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {dados.porTrabalhador.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">Sem dados no período seleccionado.</td></tr>
                  )}
                  {dados.porTrabalhador.map(r => (
                    <tr key={r.worker_id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-slate-900">{r.nome}</td>
                      <td className="px-4 py-2.5 text-slate-600 tabular-nums">{r.diasTrabalhados}</td>
                      <td className="px-4 py-2.5 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {r.obras.map(o => <Badge key={o} variant="secondary" className="text-xs">{o}</Badge>)}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 hidden lg:table-cell text-slate-500 text-xs">{r.equipas.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Por Obra */}
          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-2 px-0.5">Por Obra</h2>
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500 text-xs uppercase tracking-wide">Obra</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500 text-xs uppercase tracking-wide hidden sm:table-cell">Cliente</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500 text-xs uppercase tracking-wide">Períodos</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Equipamentos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {dados.porObra.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">Sem dados no período seleccionado.</td></tr>
                  )}
                  {dados.porObra.map(r => (
                    <tr key={r.site_id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-slate-900">{r.nome}</td>
                      <td className="px-4 py-2.5 text-slate-500 hidden sm:table-cell">{r.cliente ?? '—'}</td>
                      <td className="px-4 py-2.5 text-slate-600 tabular-nums">{r.diasAlocados}</td>
                      <td className="px-4 py-2.5 hidden md:table-cell text-xs text-slate-500">{r.equipamentos.join(', ') || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Por Equipamento */}
          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-2 px-0.5">Por Equipamento</h2>
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500 text-xs uppercase tracking-wide">Equipamento</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500 text-xs uppercase tracking-wide">Períodos usados</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Obras</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {dados.porEquipamento.length === 0 && (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground text-sm">Sem dados no período seleccionado.</td></tr>
                  )}
                  {dados.porEquipamento.map(r => (
                    <tr key={r.equipment_id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-slate-900">{r.nome}</td>
                      <td className="px-4 py-2.5 text-slate-600 tabular-nums">{r.diasUsado}</td>
                      <td className="px-4 py-2.5 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {r.obras.map(o => <Badge key={o} variant="secondary" className="text-xs">{o}</Badge>)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
