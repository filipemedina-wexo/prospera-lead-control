-- A rede de uma incorporadora pode ser formada por imobiliarias proprias ou
-- pela rede da gestora contratada. Corrige tambem os identificadores nao
-- qualificados da primeira versao da configuracao.
CREATE OR REPLACE FUNCTION public.listar_rede_comercial_empreendimento(p_empreendimento_id uuid)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT jsonb_build_object(
    'empreendimento_id', e.id,
    'gestora_id', e.gestora_id,
    'gestoras', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', g.id, 'nome', g.nome) ORDER BY g.nome) FROM public.gestoras_lancamentos AS g), '[]'::jsonb),
    'imobiliarias', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', i.id, 'nome', i.nome, 'ativo', i.ativo) ORDER BY i.nome) FROM public.imobiliarias AS i WHERE i.ativo AND (i.incorporadora_id = e.incorporadora_id OR (e.gestora_id IS NOT NULL AND i.gestora_id = e.gestora_id))), '[]'::jsonb),
    'parceiras_ativas', COALESCE((SELECT jsonb_agg(o.imobiliaria_id) FROM public.empreendimento_parceiros AS ep JOIN public.organizacoes AS o ON o.id = ep.organizacao_id WHERE ep.empreendimento_id = e.id AND ep.ativo AND o.imobiliaria_id IS NOT NULL), '[]'::jsonb)
  )
  FROM public.empreendimentos AS e
  WHERE e.id = p_empreendimento_id AND public.pode_gerir_rede_empreendimento(e.id)
$$;

CREATE OR REPLACE FUNCTION public.salvar_rede_comercial_empreendimento(p_empreendimento_id uuid, p_gestora_id uuid DEFAULT NULL, p_imobiliarias uuid[] DEFAULT ARRAY[]::uuid[])
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_incorporadora_id uuid; v_organizacao_id uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.pode_gerir_rede_empreendimento(p_empreendimento_id) THEN RAISE EXCEPTION 'Sem permissao para configurar a rede deste empreendimento'; END IF;
  SELECT e.incorporadora_id INTO v_incorporadora_id FROM public.empreendimentos AS e WHERE e.id = p_empreendimento_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Empreendimento nao encontrado'; END IF;
  IF p_gestora_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.gestoras_lancamentos AS g WHERE g.id = p_gestora_id) THEN RAISE EXCEPTION 'Gestora de lancamentos invalida'; END IF;
  IF EXISTS (
    SELECT 1 FROM unnest(COALESCE(p_imobiliarias, ARRAY[]::uuid[])) AS escolhidas(imobiliaria_id)
    LEFT JOIN public.imobiliarias AS i ON i.id = escolhidas.imobiliaria_id
    WHERE i.id IS NULL OR NOT i.ativo OR (i.incorporadora_id <> v_incorporadora_id AND (p_gestora_id IS NULL OR i.gestora_id IS DISTINCT FROM p_gestora_id))
  ) THEN RAISE EXCEPTION 'Uma das imobiliarias nao pertence a incorporadora nem a gestora selecionada'; END IF;
  UPDATE public.empreendimentos AS e SET gestora_id = p_gestora_id WHERE e.id = p_empreendimento_id;
  UPDATE public.empreendimento_parceiros AS ep SET ativo = false WHERE ep.empreendimento_id = p_empreendimento_id;
  IF p_gestora_id IS NOT NULL THEN
    SELECT o.id INTO v_organizacao_id FROM public.organizacoes AS o WHERE o.gestora_id = p_gestora_id;
    IF v_organizacao_id IS NULL THEN RAISE EXCEPTION 'A gestora ainda nao possui organizacao operacional'; END IF;
    INSERT INTO public.empreendimento_parceiros (empreendimento_id, organizacao_id, tipo, ativo) VALUES (p_empreendimento_id, v_organizacao_id, 'gestora', true) ON CONFLICT (empreendimento_id, organizacao_id) DO UPDATE SET ativo = true;
  END IF;
  INSERT INTO public.empreendimento_parceiros (empreendimento_id, organizacao_id, tipo, ativo)
  SELECT p_empreendimento_id, o.id, 'imobiliaria', true FROM public.organizacoes AS o
  WHERE o.imobiliaria_id = ANY(COALESCE(p_imobiliarias, ARRAY[]::uuid[]))
  ON CONFLICT (empreendimento_id, organizacao_id) DO UPDATE SET ativo = true;
END;
$$;

REVOKE ALL ON FUNCTION public.listar_rede_comercial_empreendimento(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.salvar_rede_comercial_empreendimento(uuid, uuid, uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.listar_rede_comercial_empreendimento(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.salvar_rede_comercial_empreendimento(uuid, uuid, uuid[]) TO authenticated;
