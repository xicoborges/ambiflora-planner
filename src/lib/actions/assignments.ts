'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function checkConflict(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  data: string,
  periodo: 'manha' | 'tarde',
  team_id: string | null | undefined,
  worker_id: string | null | undefined,
  equipment_ids: string[],
  excludeId?: string
): Promise<string | null> {
  let q = supabase
    .from('assignments')
    .select('id, team_id, worker_id, sites!inner(nome), assignment_equipment(equipment_id)')
    .eq('data', data)
    .eq('periodo', periodo)
  if (excludeId) q = (q as any).neq('id', excludeId)

  const { data: rows } = await q as any
  const existing: any[] = rows ?? []

  if (worker_id) {
    const hit = existing.find(a => a.worker_id === worker_id)
    if (hit) return `Este trabalhador já está alocado à obra "${hit.sites?.nome}" neste período`

    const { data: mships } = await supabase
      .from('team_members').select('team_id').eq('worker_id', worker_id).is('data_fim', null) as any
    const myTeams = new Set((mships ?? []).map((m: any) => m.team_id))
    const teamHit = existing.find(a => a.team_id && myTeams.has(a.team_id))
    if (teamHit) return `Este trabalhador pertence a uma equipa já alocada à obra "${teamHit.sites?.nome}" neste período`
  }

  if (team_id) {
    const hit = existing.find(a => a.team_id === team_id)
    if (hit) return `Esta equipa já está alocada à obra "${hit.sites?.nome}" neste período`

    const { data: members } = await supabase
      .from('team_members').select('worker_id, workers!inner(nome)').eq('team_id', team_id).is('data_fim', null) as any
    for (const m of members ?? []) {
      const memberHit = existing.find(a => a.worker_id === m.worker_id)
      if (memberHit) return `"${(m.workers as any)?.nome}" já está alocado individualmente à obra "${memberHit.sites?.nome}" neste período`
    }
  }

  if (equipment_ids.length > 0) {
    const usedIds = new Set(
      existing.flatMap(a => (a.assignment_equipment ?? []).map((e: any) => e.equipment_id))
    )
    const conflicts = equipment_ids.filter(id => usedIds.has(id))
    if (conflicts.length > 0)
      return conflicts.length === 1
        ? 'Um equipamento selecionado já está alocado neste período'
        : `${conflicts.length} equipamentos selecionados já estão alocados neste período`
  }

  return null
}

export async function upsertAssignment(input: {
  id?: string
  data: string
  periodo: 'manha' | 'tarde'
  team_id?: string | null
  worker_id?: string | null
  site_id: string
  notas: string
  equipment_ids: string[]
}) {
  const supabase = await createClient()
  const { id, equipment_ids, ...fields } = input

  const conflict = await checkConflict(
    supabase, input.data, input.periodo,
    input.team_id, input.worker_id, input.equipment_ids, id
  )
  if (conflict) return { error: conflict }

  if (id) {
    const { error } = await supabase.from('assignments').update(fields).eq('id', id)
    if (error) return { error: error.message }

    await supabase.from('assignment_equipment').delete().eq('assignment_id', id)
    if (equipment_ids.length > 0) {
      const { error: eqErr } = await supabase.from('assignment_equipment').insert(
        equipment_ids.map(eq_id => ({ assignment_id: id, equipment_id: eq_id }))
      )
      if (eqErr) return { error: eqErr.message }
    }
  } else {
    const { data: created, error } = await supabase
      .from('assignments').insert(fields).select('id').single()
    if (error) return { error: error.message }

    if (equipment_ids.length > 0) {
      const { error: eqErr } = await supabase.from('assignment_equipment').insert(
        equipment_ids.map(eq_id => ({ assignment_id: created.id, equipment_id: eq_id }))
      )
      if (eqErr) {
        await supabase.from('assignments').delete().eq('id', created.id)
        return { error: eqErr.message }
      }
    }
  }

  revalidatePath('/calendario')
  return { success: true }
}

export async function bulkCreateAssignments(input: {
  data: string
  periodo: 'manha' | 'tarde'
  team_id?: string | null
  worker_id?: string | null
  site_id: string
  notas: string
  equipment_ids: string[]
}[]): Promise<{ created: number }> {
  if (input.length === 0) return { created: 0 }
  const supabase = await createClient()

  const dates = [...new Set(input.map(i => i.data))]

  // Pre-fetch all assignments at the relevant dates
  const { data: existing } = await supabase
    .from('assignments')
    .select('id, data, periodo, team_id, worker_id, assignment_equipment(equipment_id)')
    .in('data', dates) as any

  // Build slot map: "date|periodo" → assignments[]
  const slotMap: Record<string, any[]> = {}
  for (const a of existing ?? []) {
    const k = `${a.data}|${a.periodo}`
    ;(slotMap[k] ??= []).push(a)
  }

  // Pre-fetch team members for teams in input
  const teamIds = [...new Set(input.filter(i => i.team_id).map(i => i.team_id!))]
  const teamMembers: Record<string, string[]> = {}
  if (teamIds.length > 0) {
    const { data: mbs } = await supabase
      .from('team_members').select('team_id, worker_id').in('team_id', teamIds).is('data_fim', null) as any
    for (const m of mbs ?? []) (teamMembers[m.team_id] ??= []).push(m.worker_id)
  }

  let created = 0

  for (const { equipment_ids, ...fields } of input) {
    const k = `${fields.data}|${fields.periodo}`
    const slots = slotMap[k] ?? []
    let skip = false

    if (fields.team_id) {
      if (slots.some((a: any) => a.team_id === fields.team_id)) skip = true
      else {
        const memberIds = new Set(teamMembers[fields.team_id] ?? [])
        if (slots.some((a: any) => a.worker_id && memberIds.has(a.worker_id))) skip = true
      }
    }

    if (!skip && fields.worker_id) {
      if (slots.some((a: any) => a.worker_id === fields.worker_id)) skip = true
    }

    if (!skip && equipment_ids.length > 0) {
      const usedEq = new Set(
        slots.flatMap((a: any) => (a.assignment_equipment ?? []).map((e: any) => e.equipment_id))
      )
      if (equipment_ids.some(id => usedEq.has(id))) skip = true
    }

    if (skip) continue

    const { data: row, error } = await supabase
      .from('assignments').insert(fields).select('id').single() as any
    if (error) continue

    if (equipment_ids.length > 0) {
      await supabase.from('assignment_equipment').insert(
        equipment_ids.map(equipment_id => ({ assignment_id: row.id, equipment_id }))
      )
    }

    // Update slotMap to prevent intra-batch duplicates
    ;(slotMap[k] ??= []).push({
      ...fields, id: row.id,
      assignment_equipment: equipment_ids.map(id => ({ equipment_id: id })),
    })

    created++
  }

  revalidatePath('/calendario')
  return { created }
}

export async function deleteAssignments(ids: string[]) {
  if (ids.length === 0) return { success: true }
  const supabase = await createClient()
  await supabase.from('assignment_equipment').delete().in('assignment_id', ids)
  const { error } = await supabase.from('assignments').delete().in('id', ids)
  if (error) return { error: error.message }
  revalidatePath('/calendario')
  return { success: true }
}

export async function deleteAssignment(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('assignments').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/calendario')
  return { success: true }
}
