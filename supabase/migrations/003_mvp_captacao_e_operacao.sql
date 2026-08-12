-- MVP operacional: captação por empreendimento, distribuição auditável
-- e confirmação de leitura do lead pelo corretor.

ALTER TABLE empreendimentos ADD COLUMN IF NOT EXISTS gestora_id uuid REFERENCES gestoras_lancamentos (id);
ALTER TABLE imobiliarias ADD COLUMN IF NOT EXISTS gestora_id uuid REFERENCES gestoras_lancamentos (id);

-- A house da gestora pode ter corretores sem imobiliária parceira.
ALTER TABLE corretores ALTER COLUMN imobiliaria_id DROP NOT NULL;
ALTER TABLE corretores ADD COLUMN IF NOT EXISTS gestora_id uuid REFERENCES gestoras_lancamentos (id);
ALTER TABLE corretores DROP CONSTRAINT IF EXISTS corretores_vinculo_operacional_check;
ALTER TABLE corretores ADD CONSTRAINT corretores_vinculo_operacional_check CHECK (imobiliaria_id IS NOT NULL OR gestora_id IS NOT NULL);
ALTER TABLE leads ALTER COLUMN imobiliaria_id DROP NOT NULL;

-- A gestora escolhe a ordem dos blocos (house ou imobiliária).
CREATE TABLE IF NOT EXISTS blocos_distribuicao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empreendimento_id uuid NOT NULL REFERENCES empreendimentos (id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('house', 'imobiliaria')),
  corretor_id uuid REFERENCES corretores (id) ON DELETE CASCADE,
  imobiliaria_id uuid REFERENCES imobiliarias (id) ON DELETE CASCADE,
  ordem integer NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (empreendimento_id, ordem),
  CHECK ((tipo = 'house' AND corretor_id IS NOT NULL AND imobiliaria_id IS NULL) OR (tipo = 'imobiliaria' AND corretor_id IS NULL AND imobiliaria_id IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS estado_distribuicao (
  empreendimento_id uuid PRIMARY KEY REFERENCES empreendimentos (id) ON DELETE CASCADE,
  ultimo_bloco_id uuid REFERENCES blocos_distribuicao (id) ON DELETE SET NULL,
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE fila_roleta ADD COLUMN IF NOT EXISTS ordem integer NOT NULL DEFAULT 0;

-- Uma integração pertence a um único empreendimento. O segredo é guardado como hash.
CREATE TABLE IF NOT EXISTS integracoes_captacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empreendimento_id uuid NOT NULL REFERENCES empreendimentos (id) ON DELETE CASCADE,
  nome text NOT NULL,
  provedor text NOT NULL CHECK (provedor IN ('zapier', 'n8n', 'meta', 'landing_page', 'outro')),
  chave_publica uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  segredo_hash text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  desativado_em timestamptz
);

-- Registra o payload antes da distribuição para deduplicar, auditar e reprocessar falhas.
CREATE TABLE IF NOT EXISTS recebimentos_webhook (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integracao_id uuid NOT NULL REFERENCES integracoes_captacao (id) ON DELETE RESTRICT,
  id_externo text,
  chave_deduplicacao text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'recebido' CHECK (status IN ('recebido', 'processando', 'processado', 'falhou', 'duplicado')),
  lead_id uuid REFERENCES leads (id) ON DELETE SET NULL,
  erro text,
  recebido_em timestamptz NOT NULL DEFAULT now(),
  processado_em timestamptz,
  UNIQUE (integracao_id, chave_deduplicacao)
);

-- Leitura é diferente de contato e de mudança de etapa.
CREATE TABLE IF NOT EXISTS leituras_lead (
  lead_id uuid NOT NULL REFERENCES leads (id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  primeira_leitura_em timestamptz NOT NULL DEFAULT now(),
  ultima_leitura_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (lead_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_integracoes_captacao_empreendimento ON integracoes_captacao (empreendimento_id) WHERE ativo;
CREATE INDEX IF NOT EXISTS idx_recebimentos_webhook_status ON recebimentos_webhook (status, recebido_em DESC);
CREATE INDEX IF NOT EXISTS idx_leituras_lead_profile ON leituras_lead (profile_id, ultima_leitura_em DESC);

-- A Edge Function valida o segredo sem nunca receber o hash no navegador.
CREATE OR REPLACE FUNCTION validar_integracao_captacao(p_chave_publica uuid, p_segredo text)
RETURNS TABLE (integracao_id uuid, empreendimento_id uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, empreendimento_id
  FROM integracoes_captacao
  WHERE chave_publica = p_chave_publica
    AND ativo = true
    AND segredo_hash = extensions.crypt(p_segredo, segredo_hash)
$$;

REVOKE ALL ON FUNCTION validar_integracao_captacao(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION validar_integracao_captacao(uuid, text) TO service_role;

-- Escolhe o próximo bloco da gestora e o corretor menos carregado dentro da imobiliária parceira.
CREATE OR REPLACE FUNCTION distribuir_recebimento_webhook(p_recebimento_id uuid)
RETURNS TABLE (lead_id uuid, resultado text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recebimento recebimentos_webhook%ROWTYPE;
  v_empreendimento_id uuid;
  v_incorporadora_id uuid;
  v_ultimo_bloco_id uuid;
  v_ultima_ordem integer;
  v_bloco blocos_distribuicao%ROWTYPE;
  v_corretor_id uuid;
  v_imobiliaria_id uuid;
  v_nome text;
  v_telefone text;
  v_email text;
  v_lead_id uuid;
BEGIN
  SELECT r.* INTO v_recebimento
  FROM recebimentos_webhook r
  WHERE r.id = p_recebimento_id
  FOR UPDATE;

  SELECT i.empreendimento_id, e.incorporadora_id
    INTO v_empreendimento_id, v_incorporadora_id
  FROM integracoes_captacao i
  JOIN empreendimentos e ON e.id = i.empreendimento_id
  WHERE i.id = v_recebimento.integracao_id;

  IF NOT FOUND THEN RAISE EXCEPTION 'Recebimento não encontrado'; END IF;
  IF v_recebimento.status = 'processado' THEN RETURN QUERY SELECT v_recebimento.lead_id, 'processado'; RETURN; END IF;

  INSERT INTO estado_distribuicao (empreendimento_id) VALUES (v_empreendimento_id) ON CONFLICT DO NOTHING;
  SELECT ultimo_bloco_id INTO v_ultimo_bloco_id FROM estado_distribuicao WHERE empreendimento_id = v_empreendimento_id FOR UPDATE;
  SELECT ordem INTO v_ultima_ordem FROM blocos_distribuicao WHERE id = v_ultimo_bloco_id;

  SELECT * INTO v_bloco FROM blocos_distribuicao
  WHERE empreendimento_id = v_empreendimento_id AND ativo = true AND ordem > COALESCE(v_ultima_ordem, -1)
  ORDER BY ordem LIMIT 1;
  IF NOT FOUND THEN
    SELECT * INTO v_bloco FROM blocos_distribuicao
    WHERE empreendimento_id = v_empreendimento_id AND ativo = true
    ORDER BY ordem LIMIT 1;
  END IF;
  IF NOT FOUND THEN
    UPDATE recebimentos_webhook SET status = 'falhou', erro = 'Nenhum bloco ativo para o empreendimento', processado_em = now() WHERE id = p_recebimento_id;
    RETURN QUERY SELECT NULL::uuid, 'falhou'; RETURN;
  END IF;

  IF v_bloco.tipo = 'house' THEN
    SELECT id, imobiliaria_id INTO v_corretor_id, v_imobiliaria_id FROM corretores WHERE id = v_bloco.corretor_id AND ativo = true;
  ELSE
    SELECT c.id, c.imobiliaria_id INTO v_corretor_id, v_imobiliaria_id
    FROM fila_roleta f JOIN corretores c ON c.id = f.corretor_id
    WHERE f.empreendimento_id = v_empreendimento_id AND f.ativo = true AND c.ativo = true AND c.imobiliaria_id = v_bloco.imobiliaria_id
    ORDER BY f.leads_recebidos ASC, f.ordem ASC, f.ultimo_lead NULLS FIRST
    LIMIT 1 FOR UPDATE OF f;
  END IF;
  IF v_corretor_id IS NULL THEN
    UPDATE recebimentos_webhook SET status = 'falhou', erro = 'Bloco sem corretor elegível', processado_em = now() WHERE id = p_recebimento_id;
    RETURN QUERY SELECT NULL::uuid, 'falhou'; RETURN;
  END IF;

  v_nome := v_recebimento.payload #>> '{_normalizado,nome}';
  v_telefone := v_recebimento.payload #>> '{_normalizado,telefone}';
  v_email := NULLIF(v_recebimento.payload #>> '{_normalizado,email}', '');
  INSERT INTO leads (incorporadora_id, empreendimento_id, imobiliaria_id, corretor_id, nome, telefone, email)
  VALUES (v_incorporadora_id, v_empreendimento_id, v_imobiliaria_id, v_corretor_id, v_nome, v_telefone, v_email)
  RETURNING id INTO v_lead_id;

  INSERT INTO fila_roleta (corretor_id, empreendimento_id, leads_recebidos, ultimo_lead)
  VALUES (v_corretor_id, v_empreendimento_id, 1, now())
  ON CONFLICT (corretor_id, empreendimento_id) DO UPDATE SET leads_recebidos = fila_roleta.leads_recebidos + 1, ultimo_lead = now();

  INSERT INTO historico_leads (lead_id, tipo, descricao) VALUES
    (v_lead_id, 'lead_criado', 'Lead recebido pela integração de captação'),
    (v_lead_id, 'lead_distribuido', 'Lead distribuído automaticamente pela fila do empreendimento');
  UPDATE estado_distribuicao SET ultimo_bloco_id = v_bloco.id, atualizado_em = now() WHERE empreendimento_id = v_empreendimento_id;
  UPDATE recebimentos_webhook SET status = 'processado', lead_id = v_lead_id, erro = NULL, processado_em = now() WHERE id = p_recebimento_id;
  RETURN QUERY SELECT v_lead_id, 'processado';
END;
$$;

REVOKE ALL ON FUNCTION distribuir_recebimento_webhook(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION distribuir_recebimento_webhook(uuid) TO service_role;

ALTER TABLE blocos_distribuicao ENABLE ROW LEVEL SECURITY;
ALTER TABLE integracoes_captacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE recebimentos_webhook ENABLE ROW LEVEL SECURITY;
ALTER TABLE leituras_lead ENABLE ROW LEVEL SECURITY;
ALTER TABLE estado_distribuicao ENABLE ROW LEVEL SECURITY;

-- Payloads e segredos não são expostos ao navegador. As Edge Functions usam service role.
CREATE POLICY "blocos_distribuicao_select" ON blocos_distribuicao FOR SELECT USING (EXISTS (SELECT 1 FROM empreendimentos e WHERE e.id = empreendimento_id AND e.incorporadora_id = get_user_incorporadora_id()));
CREATE POLICY "integracoes_captacao_select" ON integracoes_captacao FOR SELECT USING (EXISTS (SELECT 1 FROM empreendimentos e WHERE e.id = empreendimento_id AND e.incorporadora_id = get_user_incorporadora_id()));
CREATE POLICY "leituras_lead_select" ON leituras_lead FOR SELECT USING (EXISTS (SELECT 1 FROM leads l WHERE l.id = lead_id AND l.incorporadora_id = get_user_incorporadora_id()));
CREATE POLICY "leituras_lead_upsert_own" ON leituras_lead FOR ALL USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
