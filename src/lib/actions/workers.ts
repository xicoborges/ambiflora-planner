'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const workerSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  cargo: z.string().optional(),
  data_admissao: z.string().optional(),
  notas: z.string().optional(),
})

export async function createWorker(formData: FormData) {
  const supabase = await createClient()
  const raw = Object.fromEntries(formData)
  const parsed = workerSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const data = {
    ...parsed.data,
    email: parsed.data.email || null,
    telefone: parsed.data.telefone || null,
    cargo: parsed.data.cargo || null,
    data_admissao: parsed.data.data_admissao || null,
    notas: parsed.data.notas || null,
  }

  const { error } = await supabase.from('workers').insert(data)
  if (error) return { error: error.message }

  revalidatePath('/trabalhadores')
  return { success: true }
}

export async function updateWorker(id: string, formData: FormData) {
  const supabase = await createClient()
  const raw = Object.fromEntries(formData)
  const parsed = workerSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const data = {
    ...parsed.data,
    email: parsed.data.email || null,
    telefone: parsed.data.telefone || null,
    cargo: parsed.data.cargo || null,
    data_admissao: parsed.data.data_admissao || null,
    notas: parsed.data.notas || null,
  }

  const { error } = await supabase.from('workers').update(data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/trabalhadores')
  return { success: true }
}

export async function toggleWorkerAtivo(id: string, ativo: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('workers').update({ ativo: !ativo }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/trabalhadores')
  return { success: true }
}
