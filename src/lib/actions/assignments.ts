'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function upsertAssignment(input: {
  id?: string
  data: string
  periodo: 'manha' | 'tarde'
  team_id: string
  site_id: string
  notas: string
  equipment_ids: string[]
}) {
  const supabase = await createClient()
  const { id, equipment_ids, ...fields } = input

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
      .from('assignments')
      .insert(fields)
      .select('id')
      .single()
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

export async function deleteAssignment(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('assignments').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/calendario')
  return { success: true }
}
