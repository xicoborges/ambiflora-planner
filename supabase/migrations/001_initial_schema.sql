-- ============================================================
-- Ambiflora Planner — Schema inicial
-- ============================================================

-- Extensão para UUIDs
create extension if not exists "pgcrypto";

-- Função auxiliar para atualizar updated_at automaticamente
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- TRABALHADORES
-- ============================================================
create table workers (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  telefone      text,
  email         text,
  cargo         text,
  data_admissao date,
  ativo         boolean not null default true,
  notas         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger workers_updated_at
  before update on workers
  for each row execute function update_updated_at();

-- ============================================================
-- EQUIPAS
-- ============================================================
create table teams (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  cor        text not null default '#3B82F6',
  notas      text,
  ativo      boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger teams_updated_at
  before update on teams
  for each row execute function update_updated_at();

-- ============================================================
-- MEMBROS DE EQUIPAS (relação N-N com histórico)
-- ============================================================
create table team_members (
  team_id    uuid not null references teams(id) on delete cascade,
  worker_id  uuid not null references workers(id) on delete cascade,
  data_inicio date not null default current_date,
  data_fim    date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (team_id, worker_id, data_inicio)
);

create trigger team_members_updated_at
  before update on team_members
  for each row execute function update_updated_at();

-- ============================================================
-- EQUIPAMENTOS
-- ============================================================
create table equipment (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  tipo          text,
  numero_serie  text,
  notas         text,
  ativo         boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger equipment_updated_at
  before update on equipment
  for each row execute function update_updated_at();

-- ============================================================
-- OBRAS
-- ============================================================
create type site_estado as enum ('em_curso', 'concluida', 'pausada');

create table sites (
  id                uuid primary key default gen_random_uuid(),
  nome              text not null,
  cliente           text,
  morada            text,
  data_inicio       date,
  data_fim_prevista date,
  valor             numeric(12, 2),
  estado            site_estado not null default 'em_curso',
  notas             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger sites_updated_at
  before update on sites
  for each row execute function update_updated_at();

-- ============================================================
-- ALOCAÇÕES
-- ============================================================
create type assignment_periodo as enum ('manha', 'tarde');

create table assignments (
  id         uuid primary key default gen_random_uuid(),
  data       date not null,
  periodo    assignment_periodo not null,
  team_id    uuid not null references teams(id) on delete restrict,
  site_id    uuid not null references sites(id) on delete restrict,
  notas      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Uma equipa só pode estar numa obra por período
  unique (data, periodo, team_id)
);

create trigger assignments_updated_at
  before update on assignments
  for each row execute function update_updated_at();

-- ============================================================
-- EQUIPAMENTOS POR ALOCAÇÃO
-- ============================================================
create table assignment_equipment (
  assignment_id uuid not null references assignments(id) on delete cascade,
  equipment_id  uuid not null references equipment(id) on delete restrict,
  created_at    timestamptz not null default now(),
  primary key (assignment_id, equipment_id)
);

-- Impede o mesmo equipamento em dois locais no mesmo dia+período
create or replace function check_equipment_conflict()
returns trigger as $$
declare
  conflict_count integer;
begin
  select count(*) into conflict_count
  from assignment_equipment ae
  join assignments a  on a.id  = ae.assignment_id
  join assignments na on na.id = new.assignment_id
  where ae.equipment_id   = new.equipment_id
    and a.data            = na.data
    and a.periodo         = na.periodo
    and ae.assignment_id != new.assignment_id;

  if conflict_count > 0 then
    raise exception 'Equipamento já alocado noutra obra neste dia e período';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_check_equipment_conflict
  before insert or update on assignment_equipment
  for each row execute function check_equipment_conflict();

-- ============================================================
-- ROW LEVEL SECURITY (preparado para autenticação futura)
-- ============================================================
alter table workers           enable row level security;
alter table teams             enable row level security;
alter table team_members      enable row level security;
alter table equipment         enable row level security;
alter table sites             enable row level security;
alter table assignments       enable row level security;
alter table assignment_equipment enable row level security;

-- Por agora: acesso total para utilizadores autenticados anonimamente
-- (quando adicionarmos auth real, basta substituir estas policies)
create policy "acesso_anonimo_workers"      on workers           for all using (true) with check (true);
create policy "acesso_anonimo_teams"        on teams             for all using (true) with check (true);
create policy "acesso_anonimo_team_members" on team_members      for all using (true) with check (true);
create policy "acesso_anonimo_equipment"    on equipment         for all using (true) with check (true);
create policy "acesso_anonimo_sites"        on sites             for all using (true) with check (true);
create policy "acesso_anonimo_assignments"  on assignments       for all using (true) with check (true);
create policy "acesso_anonimo_ae"           on assignment_equipment for all using (true) with check (true);
