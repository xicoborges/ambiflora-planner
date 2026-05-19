import Link from 'next/link'
import { Plus, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { SiteActions } from './site-actions'

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

export default async function ObrasPage() {
  const supabase = await createClient()
  const { data: sites } = await supabase
    .from('sites')
    .select('*, responsaveis(nome)')
    .order('nome') as any

  const emCurso = (sites as any[])?.filter((s: any) => s.estado === 'em_curso').length ?? 0

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Obras</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {emCurso} em curso · {(sites as any[])?.length ?? 0} no total
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/obras/novo" />}>
          <Plus className="h-4 w-4 mr-1.5" />
          Nova Obra
        </Button>
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b">
            <tr>
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
            {(sites as any[])?.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-14 text-center">
                  <MapPin className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma obra registada.</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Adiciona as obras onde as equipas vão ser alocadas.</p>
                </td>
              </tr>
            )}
            {(sites as any[])?.map((s: any) => (
              <tr key={s.id} className="hover:bg-muted/30 transition-colors">
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
                  <SiteActions site={s} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
