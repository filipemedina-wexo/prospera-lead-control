-- Evita ambiguidade entre a coluna da organização e o valor recebido na lista
-- de parceiros ao publicar uma distribuição.
CREATE OR REPLACE FUNCTION public.salvar_parceiros_empreendimento(p_empreendimento_id uuid, p_organizacoes uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_org uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.pode_configurar_empreendimento(p_empreendimento_id) THEN
    RAISE EXCEPTION 'Sem permissão para configurar este empreendimento';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM unnest(COALESCE(p_organizacoes, ARRAY[]::uuid[])) AS fornecido(organizacao_id)
    LEFT JOIN public.organizacoes o ON o.id = fornecido.organizacao_id
    WHERE o.id IS NULL OR o.tipo NOT IN ('gestora_lancamentos', 'imobiliaria')
  ) THEN
    RAISE EXCEPTION 'Parceiro operacional inválido';
  END IF;
  UPDATE public.empreendimento_parceiros SET ativo = false WHERE empreendimento_id = p_empreendimento_id;
  FOREACH v_org IN ARRAY COALESCE(p_organizacoes, ARRAY[]::uuid[]) LOOP
    INSERT INTO public.empreendimento_parceiros (empreendimento_id, organizacao_id, tipo, ativo)
    SELECT p_empreendimento_id, o.id,
      CASE WHEN o.tipo = 'gestora_lancamentos' THEN 'gestora' ELSE 'imobiliaria' END, true
    FROM public.organizacoes o WHERE o.id = v_org
    ON CONFLICT (empreendimento_id, organizacao_id) DO UPDATE SET ativo = true;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.salvar_parceiros_empreendimento(uuid, uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.salvar_parceiros_empreendimento(uuid, uuid[]) TO authenticated;
