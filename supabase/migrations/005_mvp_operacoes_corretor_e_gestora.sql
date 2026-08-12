-- OperaÃ§Ãµes do MVP que precisam ser auditadas no servidor e escopos da gestora.
-- Nenhuma destas funÃ§Ãµes confia em IDs de tenant enviados pelo navegador.

ALTER TABLE gestoras_lancamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gestoras_select_own" ON gestoras_lancamentos;
CREATE POLICY "gestoras_select_own" ON gestoras_lancamentos
  FOR SELECT USING (id = (SELECT gestora_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "empreendimentos_select" ON empreendimentos;
CREATE POLICY "empreendimentos_select_operational_scope" ON empreendimentos
  FOR SELECT USING (
    incorporadora_id = get_user_incorporadora_id()
    OR gestora_id = (SELECT gestora_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "imobiliarias_select" ON imobiliarias;
CREATE POLICY "imobiliarias_select_operational_scope" ON imobiliarias
  FOR SELECT USING (
    incorporadora_id = get_user_incorporadora_id()
    OR gestora_id = (SELECT gestora_id FROM profiles WHERE id = auth.uid())
    OR id = (SELECT imobiliaria_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "corretores_select" ON corretores;
CREATE POLICY "corretores_select_operational_scope" ON corretores
  FOR SELECT USING (
    gestora_id = (SELECT gestora_id FROM profiles WHERE id = auth.uid())
    OR imobiliaria_id = (SELECT imobiliaria_id FROM profiles WHERE id = auth.uid())
    OR id = (SELECT corretor_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM imobiliarias i
      WHERE i.id = corretores.imobiliaria_id
        AND i.incorporadora_id = get_user_incorporadora_id()
    )
  );

DROP POLICY IF EXISTS "blocos_distribuicao_select" ON blocos_distribuicao;
CREATE POLICY "blocos_distribuicao_select_operational_scope" ON blocos_distribuicao
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM empreendimentos e
      WHERE e.id = empreendimento_id
        AND (e.incorporadora_id = get_user_incorporadora_id()
          OR e.gestora_id = (SELECT gestora_id FROM profiles WHERE id = auth.uid()))
    )
  );

CREATE OR REPLACE FUNCTION registrar_leitura_lead(p_lead_id uuid)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_primeira_leitura timestamptz;
BEGIN
  IF auth.uid() IS NULL OR NOT pode_acessar_lead(p_lead_id) THEN
    RAISE EXCEPTION 'Lead nÃ£o acessÃ­vel';
  END IF;

  SELECT primeira_leitura_em INTO v_primeira_leitura
  FROM leituras_lead WHERE lead_id = p_lead_id AND profile_id = auth.uid();

  IF v_primeira_leitura IS NULL THEN
    INSERT INTO leituras_lead (lead_id, profile_id)
    VALUES (p_lead_id, auth.uid())
    RETURNING primeira_leitura_em INTO v_primeira_leitura;
    INSERT INTO historico_leads (lead_id, tipo, descricao, autor)
    SELECT p_lead_id, 'lead_visualizado', 'Lead visualizado pelo corretor', COALESCE(nome, email)
    FROM profiles WHERE id = auth.uid();
  ELSE
    UPDATE leituras_lead SET ultima_leitura_em = now()
    WHERE lead_id = p_lead_id AND profile_id = auth.uid();
  END IF;
  RETURN v_primeira_leitura;
END;
$$;

CREATE OR REPLACE FUNCTION atualizar_lead_operacional(
  p_lead_id uuid,
  p_status text,
  p_observacao text DEFAULT NULL,
  p_data_visita timestamptz DEFAULT NULL,
  p_motivo_perdido text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status_anterior text;
BEGIN
  IF auth.uid() IS NULL OR NOT pode_acessar_lead(p_lead_id) THEN
    RAISE EXCEPTION 'Lead nÃ£o acessÃ­vel';
  END IF;
  IF p_status NOT IN ('novo', 'em_atendimento', 'contatado', 'visita_marcada', 'proposta', 'venda', 'perdido') THEN
    RAISE EXCEPTION 'Etapa invÃ¡lida';
  END IF;

  SELECT status INTO v_status_anterior FROM leads WHERE id = p_lead_id FOR UPDATE;
  UPDATE leads SET
    status = p_status,
    data_visita = COALESCE(p_data_visita, data_visita),
    motivo_perdido = CASE WHEN p_status = 'perdido' THEN NULLIF(trim(p_motivo_perdido), '') ELSE motivo_perdido END,
    first_response_at = CASE WHEN p_status <> 'novo' THEN COALESCE(first_response_at, now()) ELSE first_response_at END
  WHERE id = p_lead_id;

  IF p_observacao IS NOT NULL AND trim(p_observacao) <> '' THEN
    INSERT INTO historico_leads (lead_id, tipo, descricao, autor)
    SELECT p_lead_id, 'interacao', trim(p_observacao), COALESCE(nome, email)
    FROM profiles WHERE id = auth.uid();
  END IF;
  IF v_status_anterior IS DISTINCT FROM p_status THEN
    INSERT INTO historico_leads (lead_id, tipo, descricao, autor, de, para)
    SELECT p_lead_id, 'status_alterado', 'Etapa atualizada pelo corretor', COALESCE(nome, email), v_status_anterior, p_status
    FROM profiles WHERE id = auth.uid();
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION registrar_leitura_lead(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION atualizar_lead_operacional(uuid, text, text, timestamptz, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION registrar_leitura_lead(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION atualizar_lead_operacional(uuid, text, text, timestamptz, text) TO authenticated;

-- A tabela de integraÃ§Ãµes guarda hashes de segredo. Ela nÃ£o Ã© uma API de navegador.
DROP POLICY IF EXISTS "integracoes_captacao_select" ON integracoes_captacao;
