-- ============================================================
-- Migração 003 — Correções ao schema inicial
-- ============================================================
-- Documenta todas as alterações feitas diretamente no Supabase
-- após a migração 001 ser aplicada. Usa guardas IF NOT EXISTS e
-- blocos DO...EXCEPTION para ser idempotente em bases de dados
-- novas e na base de dados de produção.
-- ============================================================

-- ============================================================
-- C-1: Adicionar 'por_comecar' ao enum site_estado
-- ============================================================
-- Nota: ALTER TYPE ADD VALUE não pode usar IF NOT EXISTS antes do
-- PG 9.3, mas o Supabase corre PG 15+, pelo que é seguro.
ALTER TYPE site_estado ADD VALUE IF NOT EXISTS 'por_comecar' BEFORE 'em_curso';

-- ============================================================
-- C-2: Alocações — suporte a trabalhadores individuais
-- ============================================================

-- Tornar team_id nullable (idempotente — no-op se já for nullable)
ALTER TABLE assignments ALTER COLUMN team_id DROP NOT NULL;

-- Adicionar worker_id com FK para workers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'assignments'
      AND column_name  = 'worker_id'
  ) THEN
    ALTER TABLE assignments
      ADD COLUMN worker_id uuid
        references workers(id) on delete restrict;
  END IF;
END
$$;

-- Unique constraint: um trabalhador só pode estar numa obra por período
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'assignments'::regclass
      AND conname  = 'assignments_data_periodo_worker_id_key'
  ) THEN
    ALTER TABLE assignments
      ADD CONSTRAINT assignments_data_periodo_worker_id_key
      UNIQUE NULLS NOT DISTINCT (data, periodo, worker_id);
  END IF;
END
$$;

-- ============================================================
-- Equipamentos — adicionar data_compra
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'equipment'
      AND column_name  = 'data_compra'
  ) THEN
    ALTER TABLE equipment ADD COLUMN data_compra date;
  END IF;
END
$$;

-- ============================================================
-- Responsáveis
-- ============================================================
CREATE TABLE IF NOT EXISTS responsaveis (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  cargo         text,
  telefone      text,
  data_admissao date,
  notas         text,
  ativo         boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname    = 'responsaveis_updated_at'
      AND tgrelid   = 'responsaveis'::regclass
  ) THEN
    CREATE TRIGGER responsaveis_updated_at
      BEFORE UPDATE ON responsaveis
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END
$$;

ALTER TABLE responsaveis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "acesso_anonimo_responsaveis"     ON responsaveis;
DROP POLICY IF EXISTS "acesso_autenticado_responsaveis" ON responsaveis;
CREATE POLICY "acesso_autenticado_responsaveis" ON responsaveis
  FOR ALL
  USING      (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- Obras — FK para responsaveis
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'sites'
      AND column_name  = 'responsavel_id'
  ) THEN
    ALTER TABLE sites
      ADD COLUMN responsavel_id uuid
        references responsaveis(id) on delete set null;
  END IF;
END
$$;
