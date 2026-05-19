'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const teamSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').default('#3B82F6'),
  notas: z.string().optional(),
})

export async function createTeam(formData: FormData) {
  const supabase = await createClient()
  const raw = Object.fromEntries(formData)
  const parsed = teamSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase.from('teams').insert({
    ...parsed.data,
    notas: parsed.data.notas || null,
  })
  if (error) return { error: error.message }

  revalidatePath('/equipas')
  return { success: true }
}

export async function updateTeam(id: string, formData: FormData) {
  const supabase = await createClient()
  const raw = Object.fromEntries(formData)
  const parsed = teamSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase.from('teams').update({
    ...parsed.data,
    notas: parsed.data.notas || null,
  }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/equipas')
  return { success: true }
}

export async function toggleTeamAtivo(id: string, ativo: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('teams').update({ ativo: !ativo }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/equipas')
  return { success: true }
}

export async function addTeamMember(teamId: string, workerId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('team_members').insert({
    team_id: teamId,
    worker_id: workerId,
    data_inicio: new Date().toISOString().split('T')[0],
  })
  if (error) return { error: error.message }
  revalidatePath(`/equipas/${teamId}`)
  return { success: true }
}

export async function removeTeamMember(teamId: string, workerId: string, dataInicio: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('worker_id', workerId)
    .eq('data_inicio', dataInicio)
  if (error) return { error: error.message }
  revalidatePath(`/equipas/${teamId}`)
  return { success: true }
}
