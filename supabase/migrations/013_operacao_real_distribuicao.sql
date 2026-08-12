-- Operação multi-organização: configuração auditável e aplicada pelo webhook.
-- As escolhas de tenant nunca são confiadas ao navegador: as RPCs conferem o
-- perfil autenticado e o vínculo do empreendimento antes de alterar a fila.

ALTER TABLE organizacoes ADD COLUMN IF NOT EXISTS incorporadora_id uuid REFERENCES incorporadoras(id) ON DELETE SET NULL;
ALTER TABLE organizacoes ADD COLUMN IF NOT EXISTS gestora_id uuid REFERENCES gestoras_lancamentos(id) ON DELETE SET NULL;
ALTER TABLE organizacoes ADD COLUMN IF NOT EXISTS imobiliaria_id uuid REFERENCES imobiliarias(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS organizacoes_incorporadora_unica ON organizacoes(incorporadora_id) WHERE incorporadora_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS organizacoes_gestora_unica ON organizacoes(gestora_id) WHERE gestora_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS organizacoes_imobiliaria_unica ON organizacoes(imobiliaria_id) WHERE imobiliaria_id IS NOT NULL;

-- Materializa o tenant operacional para a base que já existia antes da tabela
-- organizacoes. Novos registros devem preencher o vínculo correspondente.
INSERT INTO organizacoes (tipo, nome, incorporadora_id)
SELECT 'incorporadora', nome, id FROM incorporadoras
ON CONFLICT (incorporadora_id) WHERE incorporadora_id IS NOT NULL DO NOTHING;

INSERT INTO organizacoes (tipo, nome, gestora_id)
SELECT 'gestora_lancamentos', nome, id FROM gestoras_lancamentos
ON CONFLICT (gestora_id) WHERE gestora_id IS NOT NULL DO NOTHING;

INSERT INTO organizacoes (tipo, nome, imobiliaria_id)
SELECT 'imobiliaria', nome, id FROM imobiliarias
ON CONFLICT (imobiliaria_id) WHERE imobiliaria_id IS NOT NULL DO NOTHING;

INSERT INTO organizacao_membros (organizacao_id, profile_id, papel)
SELECT o.id, p.id,
  CASE WHEN p.role = 'corretor' THEN 'corretor' WHEN p.role = 'incorporadora' THEN 'admin' ELSE 'gestor' END
FROM profiles p
JOIN organizacoes o ON o.incorporadora_id = p.incorporadora_id
  OR o.gestora_id = p.gestora_id OR o.imobiliaria_id = p.imobiliaria_id
ON CONFLICT (organizacao_id, profile_id) DO NOTHING;

DROP POLICY IF EXISTS "superadmin_profiles_select" ON profiles;
CREATE POLICY "superadmin_profiles_select" ON profiles FOR SELECT USING (pode_gerir_operacao());
DROP POLICY IF EXISTS "superadmin_profiles_update" ON profiles;
CREATE POLICY "superadmin_profiles_update" ON profiles FOR UPDATE USING (pode_gerir_operacao()) WITH CHECK (pode_gerir_operacao());

CREATE OR REPLACE FUNCTION pode_configurar_empreendimento(p_empreendimento_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT pode_gerir_operacao() OR EXISTS (
    SELECT 1 FROM empreendimentos e JOIN profiles p ON p.id = auth.uid()
    WHERE e.id = p_empreendimento_id AND e.gestora_id = p.gestora_id
  )
$$;

CREATE OR REPLACE FUNCTION salvar_parceiros_empreendimento(p_empreendimento_id uuid, p_organizacoes uuid[])
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT pode_configurar_empreendimento(p_empreendimento_id) THEN RAISE EXCEPTION 'Sem permissão para configurar este empreendimento'; END IF;
  IF EXISTS (
    SELECT 1 FROM unnest(COALESCE(p_organizacoes, ARRAY[]::uuid[])) id
    LEFT JOIN organizacoes o ON o.id = id
    WHERE o.id IS NULL OR o.tipo NOT IN ('gestora_lancamentos', 'imobiliaria')
  ) THEN RAISE EXCEPTION 'Parceiro operacional inválido'; END IF;
  UPDATE empreendimento_parceiros SET ativo = false WHERE empreendimento_id = p_empreendimento_id;
  FOREACH v_org IN ARRAY COALESCE(p_organizacoes, ARRAY[]::uuid[]) LOOP
    INSERT INTO empreendimento_parceiros (empreendimento_id, organizacao_id, tipo, ativo)
    SELECT p_empreendimento_id, o.id, CASE WHEN o.tipo = 'gestora_lancamentos' THEN 'gestora' ELSE 'imobiliaria' END, true
    FROM organizacoes o WHERE o.id = v_org
    ON CONFLICT (empreendimento_id, organizacao_id) DO UPDATE SET ativo = true;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION salvar_blocos_distribuicao_operacao(p_empreendimento_id uuid, p_blocos jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_bloco jsonb; v_ordem integer := 0; v_gestora uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT pode_configurar_empreendimento(p_empreendimento_id) THEN RAISE EXCEPTION 'Sem permissão para configurar este empreendimento'; END IF;
  SELECT gestora_id INTO v_gestora FROM empreendimentos WHERE id = p_empreendimento_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Empreendimento não encontrado'; END IF;
  IF jsonb_typeof(p_blocos) <> 'array' THEN RAISE EXCEPTION 'Fila inválida'; END IF;
  DELETE FROM blocos_distribuicao WHERE empreendimento_id = p_empreendimento_id;
  FOR v_bloco IN SELECT value FROM jsonb_array_elements(p_blocos) LOOP
    v_ordem := v_ordem + 1;
    IF v_bloco->>'tipo' = 'house' THEN
      IF NOT EXISTS (SELECT 1 FROM corretores WHERE id = (v_bloco->>'corretor_id')::uuid AND gestora_id = v_gestora) THEN RAISE EXCEPTION 'Corretor da House inválido'; END IF;
      INSERT INTO blocos_distribuicao (empreendimento_id, tipo, corretor_id, ordem, ativo)
      VALUES (p_empreendimento_id, 'house', (v_bloco->>'corretor_id')::uuid, v_ordem, COALESCE((v_bloco->>'ativo')::boolean, true));
    ELSIF v_bloco->>'tipo' = 'imobiliaria' THEN
      IF NOT EXISTS (
        SELECT 1 FROM empreendimento_parceiros ep JOIN organizacoes o ON o.id = ep.organizacao_id
        WHERE ep.empreendimento_id = p_empreendimento_id AND ep.ativo AND o.imobiliaria_id = (v_bloco->>'imobiliaria_id')::uuid
      ) THEN RAISE EXCEPTION 'Imobiliária não é parceira ativa deste empreendimento'; END IF;
      INSERT INTO blocos_distribuicao (empreendimento_id, tipo, imobiliaria_id, ordem, ativo)
      VALUES (p_empreendimento_id, 'imobiliaria', (v_bloco->>'imobiliaria_id')::uuid, v_ordem, COALESCE((v_bloco->>'ativo')::boolean, true));
    ELSE RAISE EXCEPTION 'Tipo de bloco inválido'; END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION listar_distribuicao_operacao()
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT jsonb_build_object(
    'empreendimentos', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', e.id, 'nome', e.nome, 'gestora_id', e.gestora_id) ORDER BY e.nome) FROM empreendimentos e WHERE pode_configurar_empreendimento(e.id)), '[]'::jsonb),
    'house', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', c.id, 'nome', c.nome, 'ativo', c.ativo) ORDER BY c.nome) FROM corretores c JOIN profiles p ON p.id = auth.uid() WHERE c.gestora_id = p.gestora_id OR pode_gerir_operacao()), '[]'::jsonb),
    'imobiliarias', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', i.id, 'organizacao_id', o.id, 'nome', i.nome, 'ativo', i.ativo) ORDER BY i.nome) FROM imobiliarias i JOIN organizacoes o ON o.imobiliaria_id = i.id JOIN empreendimentos e ON e.incorporadora_id = i.incorporadora_id WHERE pode_configurar_empreendimento(e.id)), '[]'::jsonb),
    'parceiros', COALESCE((SELECT jsonb_agg(jsonb_build_object('empreendimento_id', ep.empreendimento_id, 'organizacao_id', ep.organizacao_id, 'imobiliaria_id', o.imobiliaria_id, 'tipo', ep.tipo, 'ativo', ep.ativo)) FROM empreendimento_parceiros ep JOIN organizacoes o ON o.id = ep.organizacao_id WHERE pode_configurar_empreendimento(ep.empreendimento_id)), '[]'::jsonb),
    'blocos', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', b.id, 'empreendimento_id', b.empreendimento_id, 'tipo', b.tipo, 'corretor_id', b.corretor_id, 'imobiliaria_id', b.imobiliaria_id, 'ordem', b.ordem, 'ativo', b.ativo) ORDER BY b.empreendimento_id, b.ordem) FROM blocos_distribuicao b WHERE pode_configurar_empreendimento(b.empreendimento_id)), '[]'::jsonb)
  )
$$;

REVOKE ALL ON FUNCTION salvar_parceiros_empreendimento(uuid, uuid[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION salvar_blocos_distribuicao_operacao(uuid, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION listar_distribuicao_operacao() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION salvar_parceiros_empreendimento(uuid, uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION salvar_blocos_distribuicao_operacao(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION listar_distribuicao_operacao() TO authenticated;

-- A entrega é atômica: gira entre blocos da Gestora e, dentro de cada
-- imobiliária parceira, escolhe o corretor ativo menos carregado.
CREATE OR REPLACE FUNCTION distribuir_recebimento_webhook(p_recebimento_id uuid)
RETURNS TABLE (lead_id uuid, resultado text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_recebimento recebimentos_webhook%ROWTYPE; v_empreendimento_id uuid; v_incorporadora_id uuid;
  v_organizacao_captadora_id uuid; v_ultima_ordem integer; v_bloco blocos_distribuicao%ROWTYPE;
  v_corretor_id uuid; v_imobiliaria_id uuid; v_lead_id uuid; v_nome text; v_telefone text; v_email text;
BEGIN
  SELECT r.* INTO v_recebimento FROM recebimentos_webhook r WHERE r.id = p_recebimento_id FOR UPDATE;
  SELECT i.empreendimento_id, e.incorporadora_id, o.id INTO v_empreendimento_id, v_incorporadora_id, v_organizacao_captadora_id
  FROM integracoes_captacao i JOIN empreendimentos e ON e.id = i.empreendimento_id
  LEFT JOIN organizacoes o ON o.gestora_id = e.gestora_id
  WHERE i.id = v_recebimento.integracao_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Recebimento não encontrado'; END IF;
  IF v_recebimento.status = 'processado' THEN RETURN QUERY SELECT v_recebimento.lead_id, 'processado'; RETURN; END IF;
  v_nome := COALESCE(NULLIF(v_recebimento.payload #>> '{_normalizado,nome}', ''), 'Lead sem nome');
  v_telefone := COALESCE(NULLIF(v_recebimento.payload #>> '{_normalizado,telefone}', ''), 'não informado');
  v_email := NULLIF(v_recebimento.payload #>> '{_normalizado,email}', '');
  INSERT INTO estado_distribuicao (empreendimento_id) VALUES (v_empreendimento_id) ON CONFLICT DO NOTHING;
  SELECT b.ordem INTO v_ultima_ordem FROM estado_distribuicao ed LEFT JOIN blocos_distribuicao b ON b.id = ed.ultimo_bloco_id WHERE ed.empreendimento_id = v_empreendimento_id FOR UPDATE;
  SELECT b.* INTO v_bloco FROM blocos_distribuicao b
  WHERE b.empreendimento_id = v_empreendimento_id AND b.ativo
    AND (b.tipo = 'house' OR EXISTS (SELECT 1 FROM empreendimento_parceiros ep JOIN organizacoes o ON o.id = ep.organizacao_id WHERE ep.empreendimento_id = b.empreendimento_id AND ep.ativo AND o.imobiliaria_id = b.imobiliaria_id))
    AND b.ordem > COALESCE(v_ultima_ordem, -1) ORDER BY b.ordem LIMIT 1;
  IF NOT FOUND THEN
    SELECT b.* INTO v_bloco FROM blocos_distribuicao b
    WHERE b.empreendimento_id = v_empreendimento_id AND b.ativo
      AND (b.tipo = 'house' OR EXISTS (SELECT 1 FROM empreendimento_parceiros ep JOIN organizacoes o ON o.id = ep.organizacao_id WHERE ep.empreendimento_id = b.empreendimento_id AND ep.ativo AND o.imobiliaria_id = b.imobiliaria_id))
    ORDER BY b.ordem LIMIT 1;
  END IF;
  IF FOUND AND v_bloco.tipo = 'house' THEN
    SELECT id, imobiliaria_id INTO v_corretor_id, v_imobiliaria_id FROM corretores WHERE id = v_bloco.corretor_id AND ativo;
  ELSIF FOUND THEN
    SELECT c.id, c.imobiliaria_id INTO v_corretor_id, v_imobiliaria_id FROM fila_roleta f JOIN corretores c ON c.id = f.corretor_id
    WHERE f.empreendimento_id = v_empreendimento_id AND f.ativo AND c.ativo AND c.imobiliaria_id = v_bloco.imobiliaria_id
    ORDER BY f.leads_recebidos, f.ordem, f.ultimo_lead NULLS FIRST LIMIT 1 FOR UPDATE OF f;
  END IF;
  INSERT INTO leads (incorporadora_id, empreendimento_id, organizacao_captadora_id, imobiliaria_id, corretor_id, nome, telefone, email)
  VALUES (v_incorporadora_id, v_empreendimento_id, v_organizacao_captadora_id, v_imobiliaria_id, v_corretor_id, v_nome, v_telefone, v_email) RETURNING id INTO v_lead_id;
  INSERT INTO historico_leads (lead_id, tipo, descricao) VALUES
    (v_lead_id, 'lead_criado', 'Lead recebido pela integração de captação'),
    (v_lead_id, CASE WHEN v_corretor_id IS NULL THEN 'lead_sem_responsavel' ELSE 'lead_distribuido' END, CASE WHEN v_corretor_id IS NULL THEN 'Aguardando configuração ou corretor elegível' ELSE 'Lead distribuído automaticamente pela fila do empreendimento' END);
  IF v_corretor_id IS NULL THEN
    UPDATE recebimentos_webhook SET status = 'processado', lead_id = v_lead_id, erro = 'Aguardando distribuição', processado_em = now() WHERE id = p_recebimento_id;
    RETURN QUERY SELECT v_lead_id, 'sem_responsavel'; RETURN;
  END IF;
  INSERT INTO fila_roleta (corretor_id, empreendimento_id, leads_recebidos, ultimo_lead) VALUES (v_corretor_id, v_empreendimento_id, 1, now())
  ON CONFLICT (corretor_id, empreendimento_id) DO UPDATE SET leads_recebidos = fila_roleta.leads_recebidos + 1, ultimo_lead = now();
  UPDATE estado_distribuicao SET ultimo_bloco_id = v_bloco.id, atualizado_em = now() WHERE empreendimento_id = v_empreendimento_id;
  UPDATE recebimentos_webhook SET status = 'processado', lead_id = v_lead_id, erro = NULL, processado_em = now() WHERE id = p_recebimento_id;
  RETURN QUERY SELECT v_lead_id, 'processado';
END;
$$;
