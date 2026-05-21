'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const siteSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  cliente: z.string().optional(),
  morada: z.string().optional(),
  data_inicio: z.string().optional(),
  data_fim_prevista: z.string().optional(),
  valor: z.string().optional(),
  estado: z.enum(['por_comecar', 'em_curso', 'concluida', 'pausada']).default('por_comecar'),
  notas: z.string().optional(),
  responsavel_id: z.string().optional(),
})

export async function createSite(formData: FormData) {
  const supabase = await createClient()
  const raw = Object.fromEntries(formData)
  const parsed = siteSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const data = {
    ...parsed.data,
    cliente: parsed.data.cliente || null,
    morada: parsed.data.morada || null,
    data_inicio: parsed.data.data_inicio || null,
    data_fim_prevista: parsed.data.data_fim_prevista || null,
    valor: parsed.data.valor ? parseFloat(parsed.data.valor) : null,
    notas: parsed.data.notas || null,
    responsavel_id: parsed.data.responsavel_id || null,
  }

  if (data.data_inicio && data.data_fim_prevista && data.data_fim_prevista < data.data_inicio)
    return { error: 'O prazo previsto não pode ser anterior à data de início.' }

  const { error } = await supabase.from('sites').insert(data)
  if (error) return { error: error.message }

  revalidatePath('/obras')
  return { success: true }
}

export async function updateSite(id: string, formData: FormData) {
  const supabase = await createClient()
  const raw = Object.fromEntries(formData)
  const parsed = siteSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const data = {
    ...parsed.data,
    cliente: parsed.data.cliente || null,
    morada: parsed.data.morada || null,
    data_inicio: parsed.data.data_inicio || null,
    data_fim_prevista: parsed.data.data_fim_prevista || null,
    valor: parsed.data.valor ? parseFloat(parsed.data.valor) : null,
    notas: parsed.data.notas || null,
    responsavel_id: parsed.data.responsavel_id || null,
  }

  if (data.data_inicio && data.data_fim_prevista && data.data_fim_prevista < data.data_inicio)
    return { error: 'O prazo previsto não pode ser anterior à data de início.' }

  const { error } = await supabase.from('sites').update(data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/obras')
  return { success: true }
}

export async function updateSiteEstado(id: string, estado: 'por_comecar' | 'em_curso' | 'concluida' | 'pausada') {
  const supabase = await createClient()
  const { error } = await supabase.from('sites').update({ estado }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/obras')
  return { success: true }
}

export async function toggleSiteEstado(id: string, estado: string) {
  const supabase = await createClient()
  const novoEstado = estado === 'em_curso' ? 'pausada' : 'em_curso'
  const { error } = await supabase.from('sites').update({ estado: novoEstado }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/obras')
  return { success: true }
}

export async function deleteSites(ids: string[]) {
  if (ids.length === 0) return { success: true }
  const supabase = await createClient()
  const { data: siteAssignments } = await supabase.from('assignments').select('id').in('site_id', ids)
  if (siteAssignments && siteAssignments.length > 0) {
    const aIds = siteAssignments.map(a => a.id)
    await supabase.from('assignment_equipment').delete().in('assignment_id', aIds)
    await supabase.from('assignments').delete().in('id', aIds)
  }
  const { error } = await supabase.from('sites').delete().in('id', ids)
  if (error) return { error: error.message }
  revalidatePath('/obras')
  return { success: true }
}

export async function deleteSite(id: string) {
  const supabase = await createClient()
  // Apagar alocações desta obra e respetivos equipamentos
  const { data: siteAssignments } = await supabase
    .from('assignments').select('id').eq('site_id', id)
  if (siteAssignments && siteAssignments.length > 0) {
    const ids = siteAssignments.map(a => a.id)
    await supabase.from('assignment_equipment').delete().in('assignment_id', ids)
    await supabase.from('assignments').delete().in('id', ids)
  }
  const { error } = await supabase.from('sites').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/obras')
  return { success: true }
}
