'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const responsavelSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  cargo: z.string().optional(),
  telefone: z.string().optional(),
  data_admissao: z.string().optional(),
  notas: z.string().optional(),
})

export async function createResponsavel(formData: FormData) {
  const supabase = await createClient()
  const raw = Object.fromEntries(formData)
  const parsed = responsavelSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const data = {
    ...parsed.data,
    cargo: parsed.data.cargo || null,
    telefone: parsed.data.telefone || null,
    data_admissao: parsed.data.data_admissao || null,
    notas: parsed.data.notas || null,
  }

  const { error } = await supabase.from('responsaveis').insert(data)
  if (error) return { error: error.message }

  revalidatePath('/responsaveis')
  return { success: true }
}

export async function updateResponsavel(id: string, formData: FormData) {
  const supabase = await createClient()
  const raw = Object.fromEntries(formData)
  const parsed = responsavelSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const data = {
    ...parsed.data,
    cargo: parsed.data.cargo || null,
    telefone: parsed.data.telefone || null,
    data_admissao: parsed.data.data_admissao || null,
    notas: parsed.data.notas || null,
  }

  const { error } = await supabase.from('responsaveis').update(data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/responsaveis')
  return { success: true }
}

export async function toggleResponsavelAtivo(id: string, ativo: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('responsaveis').update({ ativo: !ativo }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/responsaveis')
  return { success: true }
}

export async function deleteResponsavel(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('responsaveis').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/responsaveis')
  return { success: true }
}
