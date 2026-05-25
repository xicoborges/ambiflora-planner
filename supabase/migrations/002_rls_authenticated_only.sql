-- ============================================================
-- Migração 002 — RLS: exigir autenticação em todas as tabelas
-- ============================================================
-- Substitui as políticas "using (true)" que permitiam acesso
-- sem autenticação pela chave anónima pública.
-- Só utilizadores com sessão válida (auth.role() = 'authenticated')
-- podem ler ou escrever dados.
-- ============================================================

-- WORKERS
drop policy if exists "acesso_anonimo_workers" on workers;
create policy "acesso_autenticado_workers" on workers
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- TEAMS
drop policy if exists "acesso_anonimo_teams" on teams;
create policy "acesso_autenticado_teams" on teams
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- TEAM_MEMBERS
drop policy if exists "acesso_anonimo_team_members" on team_members;
create policy "acesso_autenticado_team_members" on team_members
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- EQUIPMENT
drop policy if exists "acesso_anonimo_equipment" on equipment;
create policy "acesso_autenticado_equipment" on equipment
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- SITES
drop policy if exists "acesso_anonimo_sites" on sites;
create policy "acesso_autenticado_sites" on sites
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ASSIGNMENTS
drop policy if exists "acesso_anonimo_assignments" on assignments;
create policy "acesso_autenticado_assignments" on assignments
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ASSIGNMENT_EQUIPMENT
drop policy if exists "acesso_anonimo_ae" on assignment_equipment;
create policy "acesso_autenticado_ae" on assignment_equipment
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- RESPONSAVEIS: tabela criada em 003_fix_schema.sql — RLS tratado aí.
