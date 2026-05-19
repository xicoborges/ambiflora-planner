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
  estado: z.enum(['em_curso', 'concluida', 'pausada']).default('em_curso'),
  notas: z.string().optional(),
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
  }

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
  }

  const { error } = await supabase.from('sites').update(data).eq('id', id)
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
