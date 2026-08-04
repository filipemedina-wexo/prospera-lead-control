-- Evita conflito entre a coluna retornada `id` e o id do empreendimento.
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
  IF NOT EXISTS (
    SELECT 1
    FROM empreendimentos e
    WHERE e.id = p_empreendimento_id
      AND e.incorporadora_id = v_incorporadora_id
  ) THEN
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
