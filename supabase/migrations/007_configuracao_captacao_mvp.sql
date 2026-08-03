-- Configuração segura da captação pelo próprio ambiente autenticado.
-- O segredo do webhook só é retornado uma vez, no momento da criação.

CREATE OR REPLACE FUNCTION criar_empreendimento_operacional(
  p_nome text,
  p_cidade text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_incorporadora_id uuid;
  v_empreendimento_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Usuário não autenticado'; END IF;
  v_incorporadora_id := get_user_incorporadora_id();
  IF v_incorporadora_id IS NULL THEN RAISE EXCEPTION 'Perfil sem incorporadora vinculada'; END IF;
  IF NULLIF(trim(p_nome), '') IS NULL THEN RAISE EXCEPTION 'Informe o nome do empreendimento'; END IF;

  INSERT INTO empreendimentos (incorporadora_id, nome, cidade, status_obra)
  VALUES (v_incorporadora_id, trim(p_nome), NULLIF(trim(p_cidade), ''), 'lancamento')
  RETURNING id INTO v_empreendimento_id;
  RETURN v_empreendimento_id;
END;
$$;

CREATE OR REPLACE FUNCTION criar_integracao_captacao(
  p_empreendimento_id uuid,
  p_nome text,
  p_provedor text
)
RETURNS TABLE (id uuid, chave_publica uuid, segredo text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_incorporadora_id uuid;
  v_segredo text := encode(extensions.gen_random_bytes(32), 'hex');
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Usuário não autenticado'; END IF;
  v_incorporadora_id := get_user_incorporadora_id();
  IF NOT EXISTS (SELECT 1 FROM empreendimentos WHERE id = p_empreendimento_id AND incorporadora_id = v_incorporadora_id) THEN
    RAISE EXCEPTION 'Empreendimento não acessível';
  END IF;
  IF NULLIF(trim(p_nome), '') IS NULL THEN RAISE EXCEPTION 'Informe o nome da integração'; END IF;
  IF p_provedor NOT IN ('zapier', 'n8n', 'meta', 'landing_page', 'outro') THEN RAISE EXCEPTION 'Provedor inválido'; END IF;

  RETURN QUERY
  INSERT INTO integracoes_captacao (empreendimento_id, nome, provedor, segredo_hash)
  VALUES (p_empreendimento_id, trim(p_nome), p_provedor, extensions.crypt(v_segredo, extensions.gen_salt('bf')))
  RETURNING integracoes_captacao.id, integracoes_captacao.chave_publica, v_segredo;
END;
$$;

CREATE OR REPLACE FUNCTION listar_integracoes_captacao()
RETURNS TABLE (id uuid, empreendimento_id uuid, empreendimento_nome text, nome text, provedor text, chave_publica uuid, ativo boolean, criado_em timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.id, i.empreendimento_id, e.nome, i.nome, i.provedor, i.chave_publica, i.ativo, i.criado_em
  FROM integracoes_captacao i
  JOIN empreendimentos e ON e.id = i.empreendimento_id
  WHERE e.incorporadora_id = get_user_incorporadora_id()
  ORDER BY i.criado_em DESC;
$$;

REVOKE ALL ON FUNCTION criar_empreendimento_operacional(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION criar_integracao_captacao(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION listar_integracoes_captacao() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION criar_empreendimento_operacional(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION criar_integracao_captacao(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION listar_integracoes_captacao() TO authenticated;
