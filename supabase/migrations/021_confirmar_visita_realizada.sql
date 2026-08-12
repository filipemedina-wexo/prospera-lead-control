ALTER TABLE leads ADD COLUMN IF NOT EXISTS visita_realizada_em timestamptz;

CREATE OR REPLACE FUNCTION confirmar_visita_realizada(
  p_lead_id uuid,
  p_feedback text DEFAULT NULL
)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_realizada_em timestamptz;
BEGIN
  IF auth.uid() IS NULL OR NOT pode_acessar_lead(p_lead_id) THEN
    RAISE EXCEPTION 'Lead nao acessivel';
  END IF;

  UPDATE leads
  SET visita_realizada_em = COALESCE(visita_realizada_em, now())
  WHERE id = p_lead_id
  RETURNING visita_realizada_em INTO v_realizada_em;

  IF v_realizada_em IS NULL THEN
    RAISE EXCEPTION 'Lead nao encontrado';
  END IF;

  INSERT INTO historico_leads (lead_id, tipo, descricao, autor)
  SELECT p_lead_id, 'interacao', COALESCE(NULLIF(trim(p_feedback), ''), 'Visita realizada confirmada pelo corretor'), COALESCE(nome, email)
  FROM profiles WHERE id = auth.uid();

  RETURN v_realizada_em;
END;
$$;

REVOKE ALL ON FUNCTION confirmar_visita_realizada(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION confirmar_visita_realizada(uuid, text) TO authenticated;
