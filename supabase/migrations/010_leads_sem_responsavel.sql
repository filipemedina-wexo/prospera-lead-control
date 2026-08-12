-- Um lead nunca pode desaparecer porque a distribuição ainda não foi configurada.
-- Ele entra na fila da incorporadora como "sem responsável" até ser distribuído.
ALTER TABLE leads ALTER COLUMN imobiliaria_id DROP NOT NULL;
ALTER TABLE leads ALTER COLUMN corretor_id DROP NOT NULL;

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
  SELECT r.* INTO v_recebimento FROM recebimentos_webhook r WHERE r.id = p_recebimento_id FOR UPDATE;
  SELECT i.empreendimento_id, e.incorporadora_id INTO v_empreendimento_id, v_incorporadora_id
    FROM integracoes_captacao i JOIN empreendimentos e ON e.id = i.empreendimento_id WHERE i.id = v_recebimento.integracao_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Recebimento não encontrado'; END IF;
  IF v_recebimento.status = 'processado' THEN RETURN QUERY SELECT v_recebimento.lead_id, 'processado'; RETURN; END IF;

  v_nome := v_recebimento.payload #>> '{_normalizado,nome}';
  v_telefone := v_recebimento.payload #>> '{_normalizado,telefone}';
  v_email := NULLIF(v_recebimento.payload #>> '{_normalizado,email}', '');

  INSERT INTO estado_distribuicao (empreendimento_id) VALUES (v_empreendimento_id) ON CONFLICT DO NOTHING;
  SELECT ultimo_bloco_id INTO v_ultimo_bloco_id FROM estado_distribuicao WHERE empreendimento_id = v_empreendimento_id FOR UPDATE;
  SELECT ordem INTO v_ultima_ordem FROM blocos_distribuicao WHERE id = v_ultimo_bloco_id;
  SELECT * INTO v_bloco FROM blocos_distribuicao
    WHERE empreendimento_id = v_empreendimento_id AND ativo = true AND ordem > COALESCE(v_ultima_ordem, -1)
    ORDER BY ordem LIMIT 1;
  IF NOT FOUND THEN
    SELECT * INTO v_bloco FROM blocos_distribuicao WHERE empreendimento_id = v_empreendimento_id AND ativo = true ORDER BY ordem LIMIT 1;
  END IF;

  IF NOT FOUND THEN
    INSERT INTO leads (incorporadora_id, empreendimento_id, nome, telefone, email)
      VALUES (v_incorporadora_id, v_empreendimento_id, v_nome, v_telefone, v_email)
      RETURNING id INTO v_lead_id;
    INSERT INTO historico_leads (lead_id, tipo, descricao) VALUES
      (v_lead_id, 'lead_criado', 'Lead recebido pela integração de captação'),
      (v_lead_id, 'lead_sem_responsavel', 'Aguardando configuração de distribuição');
    UPDATE recebimentos_webhook SET status = 'processado', lead_id = v_lead_id, erro = 'Aguardando distribuição', processado_em = now() WHERE id = p_recebimento_id;
    RETURN QUERY SELECT v_lead_id, 'sem_responsavel'; RETURN;
  END IF;

  IF v_bloco.tipo = 'house' THEN
    SELECT id, imobiliaria_id INTO v_corretor_id, v_imobiliaria_id FROM corretores WHERE id = v_bloco.corretor_id AND ativo = true;
  ELSE
    SELECT c.id, c.imobiliaria_id INTO v_corretor_id, v_imobiliaria_id
      FROM fila_roleta f JOIN corretores c ON c.id = f.corretor_id
      WHERE f.empreendimento_id = v_empreendimento_id AND f.ativo = true AND c.ativo = true AND c.imobiliaria_id = v_bloco.imobiliaria_id
      ORDER BY f.leads_recebidos ASC, f.ordem ASC, f.ultimo_lead NULLS FIRST LIMIT 1 FOR UPDATE OF f;
  END IF;

  IF v_corretor_id IS NULL THEN
    INSERT INTO leads (incorporadora_id, empreendimento_id, nome, telefone, email)
      VALUES (v_incorporadora_id, v_empreendimento_id, v_nome, v_telefone, v_email)
      RETURNING id INTO v_lead_id;
    INSERT INTO historico_leads (lead_id, tipo, descricao) VALUES
      (v_lead_id, 'lead_criado', 'Lead recebido pela integração de captação'),
      (v_lead_id, 'lead_sem_responsavel', 'Bloco de distribuição sem corretor elegível');
    UPDATE recebimentos_webhook SET status = 'processado', lead_id = v_lead_id, erro = 'Aguardando corretor elegível', processado_em = now() WHERE id = p_recebimento_id;
    RETURN QUERY SELECT v_lead_id, 'sem_responsavel'; RETURN;
  END IF;

  INSERT INTO leads (incorporadora_id, empreendimento_id, imobiliaria_id, corretor_id, nome, telefone, email)
    VALUES (v_incorporadora_id, v_empreendimento_id, v_imobiliaria_id, v_corretor_id, v_nome, v_telefone, v_email) RETURNING id INTO v_lead_id;
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

-- Recupera os leads recebidos antes de existir uma regra de distribuição.
DO $$
DECLARE
  v_recebimento record;
BEGIN
  FOR v_recebimento IN
    SELECT id FROM recebimentos_webhook
    WHERE lead_id IS NULL AND status IN ('recebido', 'falhou')
  LOOP
    PERFORM distribuir_recebimento_webhook(v_recebimento.id);
  END LOOP;
END;
$$;
