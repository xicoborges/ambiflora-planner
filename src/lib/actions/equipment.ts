'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const equipmentSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.string().optional(),
  numero_serie: z.string().optional(),
  notas: z.string().optional(),
})

export async function createEquipment(formData: FormData) {
  const supabase = await createClient()
  const raw = Object.fromEntries(formData)
  const parsed = equipmentSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const data = {
    ...parsed.data,
    tipo: parsed.data.tipo || null,
    numero_serie: parsed.data.numero_serie || null,
    notas: parsed.data.notas || null,
  }

  const { error } = await supabase.from('equipment').insert(data)
  if (error) return { error: error.message }

  revalidatePath('/equipamentos')
  return { success: true }
}

export async function updateEquipment(id: string, formData: FormData) {
  const supabase = await createClient()
  const raw = Object.fromEntries(formData)
  const parsed = equipmentSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const data = {
    ...parsed.data,
    tipo: parsed.data.tipo || null,
    numero_serie: parsed.data.numero_serie || null,
    notas: parsed.data.notas || null,
  }

  const { error } = await supabase.from('equipment').update(data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/equipamentos')
  return { success: true }
}

export async function toggleEquipmentAtivo(id: string, ativo: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('equipment').update({ ativo: !ativo }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/equipamentos')
  return { success: true }
}

export async function deleteEquipment(id: string) {
  const supabase = await createClient()
  await supabase.from('assignment_equipment').delete().eq('equipment_id', id)
  const { error } = await supabase.from('equipment').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/equipamentos')
  return { success: true }
}

export async function deleteEquipmentBulk(ids: string[]) {
  if (ids.length === 0) return { success: true }
  const supabase = await createClient()
  await supabase.from('assignment_equipment').delete().in('equipment_id', ids)
  const { error } = await supabase.from('equipment').delete().in('id', ids)
  if (error) return { error: error.message }
  revalidatePath('/equipamentos')
  return { success: true }
}
