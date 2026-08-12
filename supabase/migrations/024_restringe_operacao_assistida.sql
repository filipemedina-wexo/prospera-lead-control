-- A operação assistida é uma ferramenta da Central, não uma forma de um
-- superadmin assumir outro administrador. A regra também vale para chamadas
-- diretas à RPC, fora da interface.
CREATE OR REPLACE FUNCTION public.registrar_operacao_assistida(p_alvo_id uuid, p_acao text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_alvo_superadmin boolean;
BEGIN
  IF auth.uid() IS NULL OR NOT pode_gerir_operacao() THEN
    RAISE EXCEPTION 'Apenas a Central Prospera pode operar como outro usuário';
  END IF;
  SELECT is_superadmin INTO v_alvo_superadmin FROM profiles WHERE id = p_alvo_id;
  IF p_acao NOT IN ('iniciar', 'encerrar') OR v_alvo_superadmin IS NULL THEN
    RAISE EXCEPTION 'Operação assistida inválida';
  END IF;
  IF v_alvo_superadmin THEN
    RAISE EXCEPTION 'Não é permitido operar como outro administrador da Central';
  END IF;
  INSERT INTO operacoes_assistidas (operador_id, alvo_id, acao) VALUES (auth.uid(), p_alvo_id, p_acao);
END;
$$;

REVOKE ALL ON FUNCTION public.registrar_operacao_assistida(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.registrar_operacao_assistida(uuid, text) TO authenticated;
