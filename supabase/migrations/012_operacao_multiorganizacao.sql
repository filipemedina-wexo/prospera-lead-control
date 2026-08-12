-- Organizações são os tenants; papéis são vínculos de usuários, não tenants.
CREATE TABLE IF NOT EXISTS organizacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL CHECK (tipo IN ('incorporadora','gestora_lancamentos','imobiliaria')),
  nome text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organizacao_membros (
  organizacao_id uuid NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  papel text NOT NULL CHECK (papel IN ('admin','gestor','corretor')),
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organizacao_id, profile_id)
);

CREATE TABLE IF NOT EXISTS empreendimento_parceiros (
  empreendimento_id uuid NOT NULL REFERENCES empreendimentos(id) ON DELETE CASCADE,
  organizacao_id uuid NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('gestora','imobiliaria')),
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (empreendimento_id, organizacao_id)
);

ALTER TABLE campanhas ADD COLUMN IF NOT EXISTS organizacao_captadora_id uuid REFERENCES organizacoes(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS organizacao_captadora_id uuid REFERENCES organizacoes(id);

ALTER TABLE organizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizacao_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE empreendimento_parceiros ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION pode_gerir_operacao()
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT COALESCE((SELECT is_superadmin FROM profiles WHERE id = auth.uid()), false)
$$;

CREATE POLICY "superadmin_organizacoes" ON organizacoes FOR ALL USING (pode_gerir_operacao()) WITH CHECK (pode_gerir_operacao());
CREATE POLICY "superadmin_membros" ON organizacao_membros FOR ALL USING (pode_gerir_operacao()) WITH CHECK (pode_gerir_operacao());
CREATE POLICY "superadmin_parceiros" ON empreendimento_parceiros FOR ALL USING (pode_gerir_operacao()) WITH CHECK (pode_gerir_operacao());
