'use server'

import { createClient } from '@/lib/supabase/server'
import type { RelatorioData } from './relatorios-client'

export async function gerarRelatorio(
  dataInicio: string,
  dataFim: string
): Promise<RelatorioData | { error: string }> {
  const supabase = await createClient()

  const { data: assignments, error } = await supabase
    .from('assignments')
    .select(`
      id,
      data,
      periodo,
      team_id,
      site_id,
      teams ( id, nome ),
      sites ( id, nome, cliente ),
      assignment_equipment (
        equipment_id,
        equipment ( id, nome )
      )
    `)
    .gte('data', dataInicio)
    .lte('data', dataFim)

  if (error) return { error: error.message }

  // Team members to map workers → teams
  const { data: teamMembers, error: tmErr } = await supabase
    .from('team_members')
    .select('worker_id, team_id, workers ( id, nome )')

  if (tmErr) return { error: tmErr.message }

  const asgList = assignments ?? []

  // ── Por Trabalhador ──────────────────────────────────────────────────────────
  const workerMap = new Map<string, {
    worker_id: string
    nome: string
    datasSet: Set<string>
    obrasSet: Set<string>
    equipasSet: Set<string>
  }>()

  for (const a of asgList) {
    const teamId = a.team_id
    const members = (teamMembers ?? []).filter(tm => tm.team_id === teamId)

    for (const tm of members) {
      const wId = tm.worker_id
      const wNome = (tm.workers as { id: string; nome: string } | null)?.nome ?? wId

      if (!workerMap.has(wId)) {
        workerMap.set(wId, {
          worker_id: wId,
          nome: wNome,
          datasSet: new Set(),
          obrasSet: new Set(),
          equipasSet: new Set(),
        })
      }
      const entry = workerMap.get(wId)!
      entry.datasSet.add(a.data)
      if (a.sites) entry.obrasSet.add((a.sites as { nome: string }).nome)
      if (a.teams) entry.equipasSet.add((a.teams as { nome: string }).nome)
    }
  }

  const porTrabalhador = Array.from(workerMap.values())
    .map(w => ({
      worker_id: w.worker_id,
      nome: w.nome,
      diasTrabalhados: w.datasSet.size,
      obras: Array.from(w.obrasSet).sort(),
      equipas: Array.from(w.equipasSet).sort(),
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt'))

  // ── Por Obra ─────────────────────────────────────────────────────────────────
  const siteMap = new Map<string, {
    site_id: string
    nome: string
    cliente: string | null
    periodosSet: Set<string>
    equipasSet: Set<string>
    equipamentosSet: Set<string>
  }>()

  for (const a of asgList) {
    const sId = a.site_id
    const site = a.sites as { id: string; nome: string; cliente: string | null } | null

    if (!siteMap.has(sId)) {
      siteMap.set(sId, {
        site_id: sId,
        nome: site?.nome ?? sId,
        cliente: site?.cliente ?? null,
        periodosSet: new Set(),
        equipasSet: new Set(),
        equipamentosSet: new Set(),
      })
    }
    const entry = siteMap.get(sId)!
    entry.periodosSet.add(`${a.data}|${a.periodo}`)
    if (a.teams) entry.equipasSet.add((a.teams as { nome: string }).nome)

    const eqs = a.assignment_equipment as { equipment_id: string; equipment: { nome: string } | null }[]
    for (const eq of eqs ?? []) {
      if (eq.equipment?.nome) entry.equipamentosSet.add(eq.equipment.nome)
    }
  }

  const porObra = Array.from(siteMap.values())
    .map(s => ({
      site_id: s.site_id,
      nome: s.nome,
      cliente: s.cliente,
      diasAlocados: s.periodosSet.size,
      equipas: Array.from(s.equipasSet).sort(),
      equipamentos: Array.from(s.equipamentosSet).sort(),
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt'))

  // ── Por Equipamento ──────────────────────────────────────────────────────────
  const eqMap = new Map<string, {
    equipment_id: string
    nome: string
    datasSet: Set<string>
    obrasSet: Set<string>
  }>()

  for (const a of asgList) {
    const eqs = a.assignment_equipment as { equipment_id: string; equipment: { id: string; nome: string } | null }[]
    for (const eq of eqs ?? []) {
      const eId = eq.equipment_id
      const eNome = eq.equipment?.nome ?? eId

      if (!eqMap.has(eId)) {
        eqMap.set(eId, { equipment_id: eId, nome: eNome, datasSet: new Set(), obrasSet: new Set() })
      }
      const entry = eqMap.get(eId)!
      entry.datasSet.add(a.data)
      if (a.sites) entry.obrasSet.add((a.sites as { nome: string }).nome)
    }
  }

  const porEquipamento = Array.from(eqMap.values())
    .map(e => ({
      equipment_id: e.equipment_id,
      nome: e.nome,
      diasUsado: e.datasSet.size,
      obras: Array.from(e.obrasSet).sort(),
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt'))

  return { porTrabalhador, porObra, porEquipamento }
}

export async function exportarExcel(
  dataInicio: string,
  dataFim: string
): Promise<{ buffer: number[] } | { error: string }> {
  const result = await gerarRelatorio(dataInicio, dataFim)
  if ('error' in result) return result

  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()

  // Folha: Por Trabalhador
  const trabRows = result.porTrabalhador.map(r => ({
    'Nome': r.nome,
    'Dias Trabalhados': r.diasTrabalhados,
    'Obras': r.obras.join(', '),
    'Equipas': r.equipas.join(', '),
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(trabRows), 'Por Trabalhador')

  // Folha: Por Obra
  const obraRows = result.porObra.map(r => ({
    'Obra': r.nome,
    'Cliente': r.cliente ?? '',
    'Períodos Alocados': r.diasAlocados,
    'Equipas': r.equipas.join(', '),
    'Equipamentos': r.equipamentos.join(', '),
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(obraRows), 'Por Obra')

  // Folha: Por Equipamento
  const eqRows = result.porEquipamento.map(r => ({
    'Equipamento': r.nome,
    'Dias Usados': r.diasUsado,
    'Obras': r.obras.join(', '),
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(eqRows), 'Por Equipamento')

  const buf: ArrayBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
  return { buffer: Array.from(new Uint8Array(buf)) }
}
