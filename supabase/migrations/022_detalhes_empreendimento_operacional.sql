-- Dados de produto usados pela operacao comercial. Materiais sao referenciados
-- por URL ate que um bucket com politica especifica seja disponibilizado.
ALTER TABLE empreendimentos
  ADD COLUMN IF NOT EXISTS endereco text,
  ADD COLUMN IF NOT EXISTS bairro text,
  ADD COLUMN IF NOT EXISTS uf text,
  ADD COLUMN IF NOT EXISTS regra_comissionamento text,
  ADD COLUMN IF NOT EXISTS total_unidades integer CHECK (total_unidades IS NULL OR total_unidades >= 0),
  ADD COLUMN IF NOT EXISTS torres integer CHECK (torres IS NULL OR torres >= 0),
  ADD COLUMN IF NOT EXISTS vagas text,
  ADD COLUMN IF NOT EXISTS diferenciais text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS copy_whatsapp text,
  ADD COLUMN IF NOT EXISTS material_url text;

DROP FUNCTION IF EXISTS criar_empreendimento_operacional(text, text);

CREATE FUNCTION criar_empreendimento_operacional(
  p_nome text,
  p_cidade text DEFAULT NULL,
  p_status_obra text DEFAULT 'lancamento',
  p_entrega_prevista text DEFAULT NULL,
  p_endereco text DEFAULT NULL,
  p_bairro text DEFAULT NULL,
  p_uf text DEFAULT NULL,
  p_regra_comissionamento text DEFAULT NULL,
  p_total_unidades integer DEFAULT NULL,
  p_torres integer DEFAULT NULL,
  p_vagas text DEFAULT NULL,
  p_diferenciais text[] DEFAULT '{}',
  p_copy_whatsapp text DEFAULT NULL,
  p_material_url text DEFAULT NULL
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
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Usuario nao autenticado'; END IF;
  v_incorporadora_id := get_user_incorporadora_id();
  IF v_incorporadora_id IS NULL THEN RAISE EXCEPTION 'Perfil sem incorporadora vinculada'; END IF;
  IF NULLIF(trim(p_nome), '') IS NULL THEN RAISE EXCEPTION 'Informe o nome do empreendimento'; END IF;
  IF p_status_obra NOT IN ('lancamento', 'em_obras', 'pronto') THEN RAISE EXCEPTION 'Status da obra invalido'; END IF;
  IF p_total_unidades IS NOT NULL AND p_total_unidades < 0 THEN RAISE EXCEPTION 'Total de unidades invalido'; END IF;
  IF p_torres IS NOT NULL AND p_torres < 0 THEN RAISE EXCEPTION 'Quantidade de torres invalida'; END IF;

  INSERT INTO empreendimentos (
    incorporadora_id, nome, cidade, status_obra, entrega_prevista,
    endereco, bairro, uf, regra_comissionamento, total_unidades, torres,
    vagas, diferenciais, copy_whatsapp, material_url
  ) VALUES (
    v_incorporadora_id, trim(p_nome), NULLIF(trim(p_cidade), ''), p_status_obra,
    NULLIF(trim(p_entrega_prevista), ''), NULLIF(trim(p_endereco), ''),
    NULLIF(trim(p_bairro), ''), NULLIF(upper(trim(p_uf)), ''),
    NULLIF(trim(p_regra_comissionamento), ''), p_total_unidades, p_torres,
    NULLIF(trim(p_vagas), ''), COALESCE(p_diferenciais, '{}'),
    NULLIF(trim(p_copy_whatsapp), ''), NULLIF(trim(p_material_url), '')
  ) RETURNING id INTO v_empreendimento_id;

  RETURN v_empreendimento_id;
END;
$$;

REVOKE ALL ON FUNCTION criar_empreendimento_operacional(text, text, text, text, text, text, text, text, integer, integer, text, text[], text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION criar_empreendimento_operacional(text, text, text, text, text, text, text, text, integer, integer, text, text[], text, text) TO authenticated;
