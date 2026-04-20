-- ============================================================
-- Prospera Lead Control — Full PostgreSQL Schema
-- Multi-tenant SaaS for real estate lead management
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

-- Tenant root
CREATE TABLE IF NOT EXISTS incorporadoras (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        text        NOT NULL,
  criado_em   timestamptz NOT NULL DEFAULT now()
);

-- Empreendimentos (developments) pertaining to an incorporadora
CREATE TABLE IF NOT EXISTS empreendimentos (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  incorporadora_id  uuid        NOT NULL REFERENCES incorporadoras (id) ON DELETE CASCADE,
  nome              text        NOT NULL,
  cidade            text,
  status_obra       text        CHECK (status_obra IN ('lancamento', 'em_obras', 'pronto')),
  entrega_prevista  text,
  descricao         text,
  imagem_url        text,
  criado_em         timestamptz NOT NULL DEFAULT now()
);

-- Real estate agencies (imobiliarias)
CREATE TABLE IF NOT EXISTS imobiliarias (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  incorporadora_id  uuid        NOT NULL REFERENCES incorporadoras (id) ON DELETE CASCADE,
  nome              text        NOT NULL,
  cidade            text,
  ativo             boolean     NOT NULL DEFAULT true,
  criado_em         timestamptz NOT NULL DEFAULT now()
);

-- Brokers / agents (corretores)
CREATE TABLE IF NOT EXISTS corretores (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  imobiliaria_id  uuid        NOT NULL REFERENCES imobiliarias (id) ON DELETE CASCADE,
  nome            text        NOT NULL,
  email           text        UNIQUE,
  pontos          integer     NOT NULL DEFAULT 0,
  ativo           boolean     NOT NULL DEFAULT true,
  avatar_url      text,
  telefone        text,
  criado_em       timestamptz NOT NULL DEFAULT now()
);

-- Leads (core business entity)
CREATE TABLE IF NOT EXISTS leads (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  incorporadora_id    uuid        NOT NULL REFERENCES incorporadoras (id) ON DELETE CASCADE,
  empreendimento_id   uuid        NOT NULL REFERENCES empreendimentos (id),
  imobiliaria_id      uuid        NOT NULL REFERENCES imobiliarias (id),
  corretor_id         uuid        NOT NULL REFERENCES corretores (id),
  nome                text        NOT NULL,
  telefone            text        NOT NULL,
  email               text,
  status              text        NOT NULL DEFAULT 'novo'
                        CHECK (status IN ('novo', 'em_atendimento', 'contatado', 'visita_marcada', 'proposta', 'venda', 'perdido')),
  tentativas_contato  integer     NOT NULL DEFAULT 0,
  ultima_tentativa    timestamptz,
  motivo_perdido      text,
  data_visita         timestamptz,
  first_response_at   timestamptz,
  public_token        text        UNIQUE,
  criado_em           timestamptz NOT NULL DEFAULT now()
);

-- Lead history / audit trail
CREATE TABLE IF NOT EXISTS historico_leads (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     uuid        NOT NULL REFERENCES leads (id) ON DELETE CASCADE,
  tipo        text        NOT NULL,
  descricao   text        NOT NULL,
  autor       text,
  de          text,
  para        text,
  criado_em   timestamptz NOT NULL DEFAULT now()
);

-- Marketing campaigns
CREATE TABLE IF NOT EXISTS campanhas (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  incorporadora_id    uuid        NOT NULL REFERENCES incorporadoras (id) ON DELETE CASCADE,
  titulo              text        NOT NULL,
  descricao           text,
  meta_pontos         integer     NOT NULL,
  premio              text        NOT NULL,
  premio_imagem_url   text,
  data_inicio         timestamptz,
  data_fim            timestamptz,
  ativa               boolean     NOT NULL DEFAULT true,
  empreendimento_id   uuid        REFERENCES empreendimentos (id),
  criado_em           timestamptz NOT NULL DEFAULT now()
);

-- Per-broker goals / targets
CREATE TABLE IF NOT EXISTS metas_corretor (
  corretor_id     uuid    PRIMARY KEY REFERENCES corretores (id) ON DELETE CASCADE,
  vendas_mes      integer NOT NULL DEFAULT 0,
  sla_max_min     integer NOT NULL DEFAULT 10,
  conversao_pct   integer NOT NULL DEFAULT 10
);

-- Round-robin queue (fila roleta)
CREATE TABLE IF NOT EXISTS fila_roleta (
  corretor_id         uuid        NOT NULL REFERENCES corretores (id) ON DELETE CASCADE,
  empreendimento_id   uuid        NOT NULL REFERENCES empreendimentos (id) ON DELETE CASCADE,
  leads_recebidos     integer     NOT NULL DEFAULT 0,
  ativo               boolean     NOT NULL DEFAULT true,
  ultimo_lead         timestamptz,
  PRIMARY KEY (corretor_id, empreendimento_id)
);

-- ============================================================
-- AUTH PROFILES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id                uuid        PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  incorporadora_id  uuid        REFERENCES incorporadoras (id),
  imobiliaria_id    uuid        REFERENCES imobiliarias (id),   -- null for incorporadora managers
  corretor_id       uuid        REFERENCES corretores (id),      -- null if not a corretor
  role              text        NOT NULL CHECK (role IN ('incorporadora', 'imobiliaria', 'corretor')),
  nome              text,
  email             text,
  criado_em         timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- HELPER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_incorporadora_id()
RETURNS uuid AS $$
  SELECT incorporadora_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE incorporadoras      ENABLE ROW LEVEL SECURITY;
ALTER TABLE empreendimentos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE imobiliarias         ENABLE ROW LEVEL SECURITY;
ALTER TABLE corretores           ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads                ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_leads      ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanhas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas_corretor       ENABLE ROW LEVEL SECURITY;
ALTER TABLE fila_roleta          ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------
-- incorporadoras
-- ----------------------------------------
CREATE POLICY "incorporadoras_select" ON incorporadoras
  FOR SELECT USING (id = get_user_incorporadora_id());

CREATE POLICY "incorporadoras_insert" ON incorporadoras
  FOR INSERT WITH CHECK (id = get_user_incorporadora_id());

CREATE POLICY "incorporadoras_update" ON incorporadoras
  FOR UPDATE USING (id = get_user_incorporadora_id());

CREATE POLICY "incorporadoras_delete" ON incorporadoras
  FOR DELETE USING (id = get_user_incorporadora_id());

-- ----------------------------------------
-- empreendimentos
-- ----------------------------------------
CREATE POLICY "empreendimentos_select" ON empreendimentos
  FOR SELECT USING (incorporadora_id = get_user_incorporadora_id());

CREATE POLICY "empreendimentos_insert" ON empreendimentos
  FOR INSERT WITH CHECK (incorporadora_id = get_user_incorporadora_id());

CREATE POLICY "empreendimentos_update" ON empreendimentos
  FOR UPDATE USING (incorporadora_id = get_user_incorporadora_id());

CREATE POLICY "empreendimentos_delete" ON empreendimentos
  FOR DELETE USING (incorporadora_id = get_user_incorporadora_id());

-- ----------------------------------------
-- imobiliarias
-- ----------------------------------------
CREATE POLICY "imobiliarias_select" ON imobiliarias
  FOR SELECT USING (incorporadora_id = get_user_incorporadora_id());

CREATE POLICY "imobiliarias_insert" ON imobiliarias
  FOR INSERT WITH CHECK (incorporadora_id = get_user_incorporadora_id());

CREATE POLICY "imobiliarias_update" ON imobiliarias
  FOR UPDATE USING (incorporadora_id = get_user_incorporadora_id());

CREATE POLICY "imobiliarias_delete" ON imobiliarias
  FOR DELETE USING (incorporadora_id = get_user_incorporadora_id());

-- ----------------------------------------
-- corretores  (join via imobiliarias)
-- ----------------------------------------
CREATE POLICY "corretores_select" ON corretores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM imobiliarias i
      WHERE i.id = corretores.imobiliaria_id
        AND i.incorporadora_id = get_user_incorporadora_id()
    )
  );

CREATE POLICY "corretores_insert" ON corretores
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM imobiliarias i
      WHERE i.id = corretores.imobiliaria_id
        AND i.incorporadora_id = get_user_incorporadora_id()
    )
  );

CREATE POLICY "corretores_update" ON corretores
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM imobiliarias i
      WHERE i.id = corretores.imobiliaria_id
        AND i.incorporadora_id = get_user_incorporadora_id()
    )
  );

CREATE POLICY "corretores_delete" ON corretores
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM imobiliarias i
      WHERE i.id = corretores.imobiliaria_id
        AND i.incorporadora_id = get_user_incorporadora_id()
    )
  );

-- ----------------------------------------
-- leads
-- ----------------------------------------
CREATE POLICY "leads_select" ON leads
  FOR SELECT USING (incorporadora_id = get_user_incorporadora_id());

CREATE POLICY "leads_insert" ON leads
  FOR INSERT WITH CHECK (incorporadora_id = get_user_incorporadora_id());

CREATE POLICY "leads_update" ON leads
  FOR UPDATE USING (incorporadora_id = get_user_incorporadora_id());

CREATE POLICY "leads_delete" ON leads
  FOR DELETE USING (incorporadora_id = get_user_incorporadora_id());

-- ----------------------------------------
-- historico_leads  (via lead's incorporadora_id)
-- ----------------------------------------
CREATE POLICY "historico_leads_select" ON historico_leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads l
      WHERE l.id = historico_leads.lead_id
        AND l.incorporadora_id = get_user_incorporadora_id()
    )
  );

CREATE POLICY "historico_leads_insert" ON historico_leads
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads l
      WHERE l.id = historico_leads.lead_id
        AND l.incorporadora_id = get_user_incorporadora_id()
    )
  );

CREATE POLICY "historico_leads_update" ON historico_leads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM leads l
      WHERE l.id = historico_leads.lead_id
        AND l.incorporadora_id = get_user_incorporadora_id()
    )
  );

CREATE POLICY "historico_leads_delete" ON historico_leads
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM leads l
      WHERE l.id = historico_leads.lead_id
        AND l.incorporadora_id = get_user_incorporadora_id()
    )
  );

-- ----------------------------------------
-- campanhas
-- ----------------------------------------
CREATE POLICY "campanhas_select" ON campanhas
  FOR SELECT USING (incorporadora_id = get_user_incorporadora_id());

CREATE POLICY "campanhas_insert" ON campanhas
  FOR INSERT WITH CHECK (incorporadora_id = get_user_incorporadora_id());

CREATE POLICY "campanhas_update" ON campanhas
  FOR UPDATE USING (incorporadora_id = get_user_incorporadora_id());

CREATE POLICY "campanhas_delete" ON campanhas
  FOR DELETE USING (incorporadora_id = get_user_incorporadora_id());

-- ----------------------------------------
-- metas_corretor  (via corretor -> imobiliaria -> incorporadora)
-- ----------------------------------------
CREATE POLICY "metas_corretor_select" ON metas_corretor
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM corretores c
      JOIN imobiliarias i ON i.id = c.imobiliaria_id
      WHERE c.id = metas_corretor.corretor_id
        AND i.incorporadora_id = get_user_incorporadora_id()
    )
  );

CREATE POLICY "metas_corretor_insert" ON metas_corretor
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM corretores c
      JOIN imobiliarias i ON i.id = c.imobiliaria_id
      WHERE c.id = metas_corretor.corretor_id
        AND i.incorporadora_id = get_user_incorporadora_id()
    )
  );

CREATE POLICY "metas_corretor_update" ON metas_corretor
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM corretores c
      JOIN imobiliarias i ON i.id = c.imobiliaria_id
      WHERE c.id = metas_corretor.corretor_id
        AND i.incorporadora_id = get_user_incorporadora_id()
    )
  );

CREATE POLICY "metas_corretor_delete" ON metas_corretor
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM corretores c
      JOIN imobiliarias i ON i.id = c.imobiliaria_id
      WHERE c.id = metas_corretor.corretor_id
        AND i.incorporadora_id = get_user_incorporadora_id()
    )
  );

-- ----------------------------------------
-- fila_roleta  (via corretor -> imobiliaria -> incorporadora)
-- ----------------------------------------
CREATE POLICY "fila_roleta_select" ON fila_roleta
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM corretores c
      JOIN imobiliarias i ON i.id = c.imobiliaria_id
      WHERE c.id = fila_roleta.corretor_id
        AND i.incorporadora_id = get_user_incorporadora_id()
    )
  );

CREATE POLICY "fila_roleta_insert" ON fila_roleta
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM corretores c
      JOIN imobiliarias i ON i.id = c.imobiliaria_id
      WHERE c.id = fila_roleta.corretor_id
        AND i.incorporadora_id = get_user_incorporadora_id()
    )
  );

CREATE POLICY "fila_roleta_update" ON fila_roleta
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM corretores c
      JOIN imobiliarias i ON i.id = c.imobiliaria_id
      WHERE c.id = fila_roleta.corretor_id
        AND i.incorporadora_id = get_user_incorporadora_id()
    )
  );

CREATE POLICY "fila_roleta_delete" ON fila_roleta
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM corretores c
      JOIN imobiliarias i ON i.id = c.imobiliaria_id
      WHERE c.id = fila_roleta.corretor_id
        AND i.incorporadora_id = get_user_incorporadora_id()
    )
  );

-- ----------------------------------------
-- profiles  (user can only see/edit their own row)
-- ----------------------------------------

-- Allow the trigger (SECURITY DEFINER) to insert profiles for any new user
CREATE POLICY "profiles_insert_trigger" ON profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_delete" ON profiles
  FOR DELETE USING (id = auth.uid());

-- ============================================================
-- TRIGGERS — Auto-create profile + incorporadora on signup
-- ============================================================

-- 1. Create the profile row for every new auth user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role, incorporadora_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'incorporadora'),
    CASE
      WHEN NEW.raw_user_meta_data->>'incorporadora_id' IS NOT NULL
      THEN (NEW.raw_user_meta_data->>'incorporadora_id')::uuid
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. If the new user is an incorporadora admin with no existing incorporadora,
--    create one automatically and link it back to the profile.
CREATE OR REPLACE FUNCTION handle_new_incorporadora_user()
RETURNS TRIGGER AS $$
DECLARE
  new_inc_id uuid;
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'incorporadora'
     AND NEW.raw_user_meta_data->>'incorporadora_id' IS NULL
  THEN
    INSERT INTO incorporadoras (nome)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'empresa_nome', 'Minha Empresa'))
    RETURNING id INTO new_inc_id;

    UPDATE profiles SET incorporadora_id = new_inc_id WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- This trigger fires after on_auth_user_created so the profile row already exists
CREATE OR REPLACE TRIGGER on_auth_user_created_incorporadora
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_incorporadora_user();

-- ============================================================
-- REALTIME
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE historico_leads;
