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

  const { data, error } = await supabase.from('teams').insert({
    ...parsed.data,
    notas: parsed.data.notas || null,
  }).select('id').single()
  if (error) return { error: error.message }

  revalidatePath('/equipas')
  return { success: true, id: data.id }
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

export async function deleteTeams(ids: string[]) {
  if (ids.length === 0) return { success: true }
  const supabase = await createClient()
  const { data: teamAssignments } = await supabase.from('assignments').select('id').in('team_id', ids)
  if (teamAssignments && teamAssignments.length > 0) {
    const aIds = teamAssignments.map((a: any) => a.id)
    await supabase.from('assignment_equipment').delete().in('assignment_id', aIds)
    await supabase.from('assignments').delete().in('id', aIds)
  }
  const { error } = await supabase.from('teams').delete().in('id', ids)
  if (error) return { error: error.message }
  revalidatePath('/equipas')
  return { success: true }
}

export async function deleteTeam(id: string) {
  const supabase = await createClient()
  // Apagar alocações desta equipa e respetivos equipamentos
  const { data: teamAssignments } = await supabase
    .from('assignments').select('id').eq('team_id', id)
  if (teamAssignments && teamAssignments.length > 0) {
    const ids = teamAssignments.map(a => a.id)
    await supabase.from('assignment_equipment').delete().in('assignment_id', ids)
    await supabase.from('assignments').delete().in('id', ids)
  }
  // team_members tem ON DELETE CASCADE
  const { error } = await supabase.from('teams').delete().eq('id', id)
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
