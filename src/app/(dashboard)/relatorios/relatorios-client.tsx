'use client'

import { useState, useTransition } from 'react'
import { FileDown, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { gerarRelatorio, exportarExcel } from './actions'

export type RelatorioData = {
  linhas: {
    data: string
    siteName: string
    periodo: 'manha' | 'tarde'
    trabalhadores: string[]
    equipamentos: string[]
  }[]
}

const hoje = new Date()
const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

function toInputDate(d: Date) {
  return d.toISOString().split('T')[0]
}

function fmtDate(d: string) {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

interface Props {
  workers: { id: string; nome: string }[]
  teams: { id: string; nome: string; cor: string }[]
  sites: { id: string; nome: string; cliente: string | null }[]
  equipment: { id: string; nome: string }[]
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
    startExport(async () => {
      const result = await exportarExcel(dataInicio, dataFim)
      if ('error' in result) { toast.error(result.error); return }
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

  function handleExportPDF() {
    if (!dados) return

    const totalAlocacoes = dados.linhas.length
    const obrasUnicas = new Set(dados.linhas.map(r => r.siteName))
    const trabalhadoresUnicos = new Set(dados.linhas.flatMap(r => r.trabalhadores))
    const equipamentosUnicos = new Set(dados.linhas.flatMap(r => r.equipamentos))

    const porObra: Record<string, number> = {}
    dados.linhas.forEach(r => { porObra[r.siteName] = (porObra[r.siteName] ?? 0) + 1 })
    const obrasSorted = Object.entries(porObra).sort((a, b) => b[1] - a[1])
    const maxObra = Math.max(...Object.values(porObra), 1)

    const fmtD = (d: string) => { const [y, m, day] = d.split('-'); return `${day}/${m}/${y}` }
    const geradoEm = new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })

    const tableRows = dados.linhas.map(r => `
      <tr>
        <td>${fmtD(r.data)}</td>
        <td><strong>${r.siteName}</strong></td>
        <td>${r.periodo === 'manha' ? 'Manhã' : 'Tarde'}</td>
        <td>${r.trabalhadores.join(', ') || '—'}</td>
        <td>${r.equipamentos.join(', ') || '—'}</td>
      </tr>`).join('')

    const barRows = obrasSorted.map(([nome, count]) => `
      <div class="bar-row">
        <div class="bar-label">${nome}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${Math.round((count / maxObra) * 100)}%"></div>
        </div>
        <div class="bar-value">${count}</div>
      </div>`).join('')

    const html = `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<title>Relatório Ambiflora ${fmtD(dataInicio)} – ${fmtD(dataFim)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; padding: 32px; font-size: 13px; }
  .header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 3px solid #1a6b3a; padding-bottom: 16px; margin-bottom: 24px; }
  .logo-name { font-size: 22px; font-weight: 800; color: #1a6b3a; letter-spacing: -0.5px; }
  .header-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
  .header-right { text-align: right; font-size: 12px; color: #64748b; }
  .header-right strong { display: block; font-size: 14px; color: #1e293b; margin-bottom: 2px; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  .kpi-card { background: #f0faf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px 20px; }
  .kpi-label { font-size: 11px; color: #166534; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
  .kpi-value { font-size: 32px; font-weight: 800; color: #15803d; line-height: 1; }
  .section-title { font-size: 13px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }
  .chart-section { margin-bottom: 28px; }
  .bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
  .bar-label { width: 180px; font-size: 12px; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .bar-track { flex: 1; height: 18px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
  .bar-fill { height: 100%; background: linear-gradient(90deg, #16a34a, #22c55e); border-radius: 4px; }
  .bar-value { width: 32px; text-align: right; font-size: 12px; font-weight: 600; color: #166534; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  thead tr { background: #1a6b3a; color: #fff; }
  thead th { padding: 9px 12px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  tbody td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; color: #374151; }
  tbody tr:last-child td { border-bottom: none; }
  .footer { margin-top: 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e5e7eb; padding-top: 12px; }
  @media print { body { padding: 16px; } @page { margin: 1cm; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="logo-name">Ambiflora</div>
    <div class="header-sub">Relatório de Atividade</div>
  </div>
  <div class="header-right">
    <strong>${fmtD(dataInicio)} — ${fmtD(dataFim)}</strong>
    Gerado em ${geradoEm}
  </div>
</div>

<div class="kpi-grid">
  <div class="kpi-card">
    <div class="kpi-label">Total de Alocações</div>
    <div class="kpi-value">${totalAlocacoes}</div>
  </div>
  <div class="kpi-card">
    <div class="kpi-label">Obras</div>
    <div class="kpi-value">${obrasUnicas.size}</div>
  </div>
  <div class="kpi-card">
    <div class="kpi-label">Trabalhadores</div>
    <div class="kpi-value">${trabalhadoresUnicos.size}</div>
  </div>
  <div class="kpi-card">
    <div class="kpi-label">Equipamentos</div>
    <div class="kpi-value">${equipamentosUnicos.size}</div>
  </div>
</div>

<div class="chart-section">
  <div class="section-title">Alocações por Obra</div>
  ${barRows || '<p style="color:#94a3b8;font-size:12px">Sem dados</p>'}
</div>

<div class="section-title">Detalhe das Alocações</div>
<table>
  <thead>
    <tr>
      <th>Dia</th><th>Obra</th><th>Período</th><th>Trabalhador(es)</th><th>Equipamento(s)</th>
    </tr>
  </thead>
  <tbody>${tableRows || '<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:20px">Sem alocações</td></tr>'}</tbody>
</table>

<div class="footer">Ambiflora · Relatório gerado automaticamente</div>
<script>window.onload = () => { window.print() }<\/script>
</body>
</html>`

    const win = window.open('', '_blank', 'width=900,height=700')
    if (win) { win.document.write(html); win.document.close() }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Relatórios</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Resumo de actividade por período</p>
        </div>
        {dados && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportPDF}
              className="border-blue-400 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-500">
              <FileText className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={isExporting}>
              {isExporting
                ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                : <FileDown className="h-4 w-4 mr-2" />}
              Exportar Excel
            </Button>
          </div>
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
        <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Dia</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Obra</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Período</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Trabalhador(es)</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Equipamento(s)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {dados.linhas.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    Sem alocações no período seleccionado.
                  </td>
                </tr>
              )}
              {dados.linhas.map((r, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 tabular-nums text-slate-600 whitespace-nowrap">{fmtDate(r.data)}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-900">{r.siteName}</td>
                  <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                    {r.periodo === 'manha' ? 'Manhã' : 'Tarde'}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">
                    {r.trabalhadores.length > 0 ? r.trabalhadores.join(', ') : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 hidden md:table-cell">
                    {r.equipamentos.length > 0 ? r.equipamentos.join(', ') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {dados.linhas.length > 0 && (
            <div className="px-4 py-2.5 border-t text-xs text-muted-foreground">
              {dados.linhas.length} alocaç{dados.linhas.length === 1 ? 'ão' : 'ões'} no período
            </div>
          )}
        </div>
      )}
    </div>
  )
}
