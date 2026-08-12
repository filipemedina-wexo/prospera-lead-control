-- Cadastro atômico para a Central: a imobiliária sempre nasce com sua
-- organização operacional, necessária para convites e distribuição.
CREATE OR REPLACE FUNCTION public.criar_imobiliaria_operacao(
  p_nome text,
  p_incorporadora_id uuid,
  p_cidade text DEFAULT NULL
)
RETURNS public.imobiliarias
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_imobiliaria public.imobiliarias;
BEGIN
  IF NOT public.pode_gerir_operacao() THEN
    RAISE EXCEPTION 'Apenas a Central Prospera pode cadastrar imobiliárias';
  END IF;
  IF nullif(trim(p_nome), '') IS NULL THEN
    RAISE EXCEPTION 'Nome da imobiliária é obrigatório';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.incorporadoras WHERE id = p_incorporadora_id) THEN
    RAISE EXCEPTION 'Incorporadora não encontrada';
  END IF;

  INSERT INTO public.imobiliarias (nome, incorporadora_id, cidade)
  VALUES (trim(p_nome), p_incorporadora_id, nullif(trim(p_cidade), ''))
  RETURNING * INTO v_imobiliaria;

  INSERT INTO public.organizacoes (tipo, nome, incorporadora_id, imobiliaria_id)
  VALUES ('imobiliaria', v_imobiliaria.nome, p_incorporadora_id, v_imobiliaria.id);

  RETURN v_imobiliaria;
END;
$$;

REVOKE ALL ON FUNCTION public.criar_imobiliaria_operacao(text, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.criar_imobiliaria_operacao(text, uuid, text) TO authenticated;
