-- A Central também pode assumir o contexto de uma incorporadora que ainda não
-- possui usuário cadastrado. A identidade autenticada continua sendo a da
-- Central; este registro existe para auditoria do contexto operacional.
CREATE TABLE IF NOT EXISTS public.operacoes_assistidas_incorporadora (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operador_id uuid NOT NULL REFERENCES public.profiles(id),
  incorporadora_id uuid NOT NULL REFERENCES public.incorporadoras(id),
  acao text NOT NULL CHECK (acao IN ('iniciar', 'encerrar')),
  criado_em timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.operacoes_assistidas_incorporadora ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.registrar_operacao_assistida_organizacao(p_incorporadora_id uuid, p_acao text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.pode_gerir_operacao() THEN
    RAISE EXCEPTION 'Apenas a Central Prospera pode operar como uma incorporadora';
  END IF;
  IF p_acao NOT IN ('iniciar', 'encerrar') OR NOT EXISTS (SELECT 1 FROM public.incorporadoras WHERE id = p_incorporadora_id) THEN
    RAISE EXCEPTION 'Incorporadora inválida para operação assistida';
  END IF;
  INSERT INTO public.operacoes_assistidas_incorporadora (operador_id, incorporadora_id, acao)
  VALUES (auth.uid(), p_incorporadora_id, p_acao);
END;
$$;

REVOKE ALL ON FUNCTION public.registrar_operacao_assistida_organizacao(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.registrar_operacao_assistida_organizacao(uuid, text) TO authenticated;
