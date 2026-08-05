-- Persist contact attempts so the three-attempt rule survives refreshes and devices.
CREATE OR REPLACE FUNCTION registrar_tentativa_contato(p_lead_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tentativas integer;
BEGIN
  IF auth.uid() IS NULL OR NOT pode_acessar_lead(p_lead_id) THEN
    RAISE EXCEPTION 'Lead nao acessivel';
  END IF;

  UPDATE leads
  SET tentativas_contato = tentativas_contato + 1,
      ultima_tentativa = now()
  WHERE id = p_lead_id
  RETURNING tentativas_contato INTO v_tentativas;

  IF v_tentativas IS NULL THEN
    RAISE EXCEPTION 'Lead nao encontrado';
  END IF;

  INSERT INTO historico_leads (lead_id, tipo, descricao, autor)
  SELECT p_lead_id, 'interacao', format('Tentativa de contato %s/3 sem resposta', v_tentativas), COALESCE(nome, email)
  FROM profiles WHERE id = auth.uid();

  RETURN v_tentativas;
END;
$$;

REVOKE ALL ON FUNCTION registrar_tentativa_contato(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION registrar_tentativa_contato(uuid) TO authenticated;
