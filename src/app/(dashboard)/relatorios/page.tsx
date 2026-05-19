import { createClient } from '@/lib/supabase/server'
import { RelatoriosClient } from './relatorios-client'

export default async function RelatoriosPage() {
  const supabase = await createClient()

  const [
    { data: workers },
    { data: teams },
    { data: sites },
    { data: equipment },
  ] = await Promise.all([
    supabase.from('workers').select('id, nome').order('nome'),
    supabase.from('teams').select('id, nome, cor').order('nome'),
    supabase.from('sites').select('id, nome, cliente').order('nome'),
    supabase.from('equipment').select('id, nome').order('nome'),
  ])

  return (
    <RelatoriosClient
      workers={workers ?? []}
      teams={teams ?? []}
      sites={sites ?? []}
      equipment={equipment ?? []}
    />
  )
}
