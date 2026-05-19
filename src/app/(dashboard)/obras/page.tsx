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

export default async function ObrasPage() {
  const supabase = await createClient()
  const { data: sites } = await supabase
    .from('sites')
    .select('*')
    .order('nome')

  const emCurso = sites?.filter(s => s.estado === 'em_curso').length ?? 0

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Obras</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {emCurso} em curso · {sites?.length ?? 0} no total
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/obras/novo" />}>
          <Plus className="h-4 w-4 mr-1.5" />
          Nova Obra
        </Button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden sm:table-cell">Cliente</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden lg:table-cell">Prazo Previsto</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sites?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-14 text-center">
                  <MapPin className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma obra registada.</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Adiciona as obras onde as equipas vão ser alocadas.</p>
                </td>
              </tr>
            )}
            {sites?.map((s) => (
              <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">{s.nome}</td>
                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{s.cliente ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">
                  {s.data_fim_prevista
                    ? new Date(s.data_fim_prevista + 'T00:00:00').toLocaleDateString('pt-PT')
                    : '—'}
                </td>
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
