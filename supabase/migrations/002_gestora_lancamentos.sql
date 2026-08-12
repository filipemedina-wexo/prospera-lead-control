-- Gestora de Lançamentos: organização intermediária entre incorporadoras,
-- imobiliárias parceiras e a house própria de corretores.

CREATE TABLE IF NOT EXISTS gestoras_lancamentos (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        text        NOT NULL,
  criado_em   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS gestora_id uuid REFERENCES gestoras_lancamentos (id);

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('incorporadora', 'gestora_lancamentos', 'imobiliaria', 'corretor'));
