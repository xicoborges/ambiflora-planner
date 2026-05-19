import Link from 'next/link'
import { Plus, UserCog } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ResponsavelActions } from './responsavel-actions'

export default async function ResponsaveisPage() {
  const supabase = await createClient()
  const { data: responsaveis } = await supabase
    .from('responsaveis')
    .select('*')
    .order('nome')

  const ativos = responsaveis?.filter(r => r.ativo).length ?? 0

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Responsáveis</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {ativos} activo{ativos !== 1 ? 's' : ''} · {responsaveis?.length ?? 0} no total
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/responsaveis/novo" />}>
          <Plus className="h-4 w-4 mr-1.5" />
          Novo Responsável
        </Button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden sm:table-cell">Cargo</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Telefone</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {responsaveis?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-14 text-center">
                  <UserCog className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum responsável registado.</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Começa por adicionar o primeiro responsável.</p>
                </td>
              </tr>
            )}
            {responsaveis?.map((r) => (
              <tr key={r.id} className={`hover:bg-muted/30 transition-colors ${!r.ativo ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 font-medium text-slate-900">{r.nome}</td>
                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{r.cargo ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{r.telefone ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={r.ativo ? 'default' : 'secondary'}>
                    {r.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
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
