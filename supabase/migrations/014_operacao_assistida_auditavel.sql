-- Operação SAS: o super-admin pode enxergar a experiência de um usuário,
-- mas cada início/encerramento fica registrado no servidor. A UI jamais troca
-- o JWT ou ganha privilégios novos; a autorização continua sendo RLS.
CREATE TABLE IF NOT EXISTS operacoes_assistidas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operador_id uuid NOT NULL REFERENCES profiles(id),
  alvo_id uuid NOT NULL REFERENCES profiles(id),
  acao text NOT NULL CHECK (acao IN ('iniciar', 'encerrar')),
  criado_em timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE operacoes_assistidas ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION registrar_operacao_assistida(p_alvo_id uuid, p_acao text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT pode_gerir_operacao() THEN
    RAISE EXCEPTION 'Apenas a Central Prospera pode operar como outro usuário';
  END IF;
  IF p_acao NOT IN ('iniciar', 'encerrar') OR NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_alvo_id) THEN
    RAISE EXCEPTION 'Operação assistida inválida';
  END IF;
  INSERT INTO operacoes_assistidas (operador_id, alvo_id, acao) VALUES (auth.uid(), p_alvo_id, p_acao);
END;
$$;

REVOKE ALL ON FUNCTION registrar_operacao_assistida(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION registrar_operacao_assistida(uuid, text) TO authenticated;
