-- A incorporadora continua proprietaria do empreendimento e da captacao. Esta
-- camada libera, de forma explicita e auditavel, quais organizacoes podem
-- operar cada produto comercial.
CREATE OR REPLACE FUNCTION public.pode_gerir_rede_empreendimento(p_empreendimento_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT public.pode_gerir_operacao() OR EXISTS (
    SELECT 1 FROM public.empreendimentos e
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE e.id = p_empreendimento_id AND e.incorporadora_id = p.incorporadora_id
  )
$$;

CREATE OR REPLACE FUNCTION public.listar_rede_comercial_empreendimento(p_empreendimento_id uuid)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT jsonb_build_object(
    'empreendimento_id', e.id,
    'gestora_id', e.gestora_id,
    'gestoras', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', g.id, 'nome', g.nome) ORDER BY g.nome) FROM public.gestoras_lancamentos g), '[]'::jsonb),
    'imobiliarias', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', i.id, 'nome', i.nome, 'ativo', i.ativo) ORDER BY i.nome) FROM public.imobiliarias i WHERE i.incorporadora_id = e.incorporadora_id), '[]'::jsonb),
    'parceiras_ativas', COALESCE((SELECT jsonb_agg(o.imobiliaria_id) FROM public.empreendimento_parceiros ep JOIN public.organizacoes o ON o.id = ep.organizacao_id WHERE ep.empreendimento_id = e.id AND ep.ativo AND o.imobiliaria_id IS NOT NULL), '[]'::jsonb)
  )
  FROM public.empreendimentos e
  WHERE e.id = p_empreendimento_id AND public.pode_gerir_rede_empreendimento(e.id)
$$;

CREATE OR REPLACE FUNCTION public.salvar_rede_comercial_empreendimento(p_empreendimento_id uuid, p_gestora_id uuid DEFAULT NULL, p_imobiliarias uuid[] DEFAULT ARRAY[]::uuid[])
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_incorporadora_id uuid; v_organizacao_id uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.pode_gerir_rede_empreendimento(p_empreendimento_id) THEN
    RAISE EXCEPTION 'Sem permissao para configurar a rede deste empreendimento';
  END IF;
  SELECT incorporadora_id INTO v_incorporadora_id FROM public.empreendimentos WHERE id = p_empreendimento_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Empreendimento nao encontrado'; END IF;
  IF p_gestora_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.gestoras_lancamentos WHERE id = p_gestora_id) THEN
    RAISE EXCEPTION 'Gestora de lancamentos invalida';
  END IF;
  IF EXISTS (SELECT 1 FROM unnest(COALESCE(p_imobiliarias, ARRAY[]::uuid[])) AS id LEFT JOIN public.imobiliarias i ON i.id = id WHERE i.id IS NULL OR i.incorporadora_id <> v_incorporadora_id OR NOT i.ativo) THEN
    RAISE EXCEPTION 'Uma das imobiliarias nao pertence a esta incorporadora ou esta inativa';
  END IF;
  UPDATE public.empreendimentos SET gestora_id = p_gestora_id WHERE id = p_empreendimento_id;
  UPDATE public.empreendimento_parceiros SET ativo = false WHERE empreendimento_id = p_empreendimento_id;
  IF p_gestora_id IS NOT NULL THEN
    SELECT id INTO v_organizacao_id FROM public.organizacoes WHERE gestora_id = p_gestora_id;
    IF v_organizacao_id IS NULL THEN RAISE EXCEPTION 'A gestora ainda nao possui organizacao operacional'; END IF;
    INSERT INTO public.empreendimento_parceiros (empreendimento_id, organizacao_id, tipo, ativo) VALUES (p_empreendimento_id, v_organizacao_id, 'gestora', true)
    ON CONFLICT (empreendimento_id, organizacao_id) DO UPDATE SET ativo = true;
  END IF;
  INSERT INTO public.empreendimento_parceiros (empreendimento_id, organizacao_id, tipo, ativo)
  SELECT p_empreendimento_id, o.id, 'imobiliaria', true FROM public.organizacoes o
  WHERE o.imobiliaria_id = ANY(COALESCE(p_imobiliarias, ARRAY[]::uuid[]))
  ON CONFLICT (empreendimento_id, organizacao_id) DO UPDATE SET ativo = true;
END;
$$;

DROP POLICY IF EXISTS "empreendimentos_select_operational_scope" ON public.empreendimentos;
CREATE POLICY "empreendimentos_select_operational_scope" ON public.empreendimentos FOR SELECT USING (
  public.pode_gerir_operacao()
  OR incorporadora_id = public.get_user_incorporadora_id()
  OR gestora_id = (SELECT gestora_id FROM public.profiles WHERE id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.empreendimento_parceiros ep JOIN public.organizacoes o ON o.id = ep.organizacao_id
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE ep.empreendimento_id = empreendimentos.id AND ep.ativo AND o.imobiliaria_id = p.imobiliaria_id
  )
);

REVOKE ALL ON FUNCTION public.listar_rede_comercial_empreendimento(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.salvar_rede_comercial_empreendimento(uuid, uuid, uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.listar_rede_comercial_empreendimento(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.salvar_rede_comercial_empreendimento(uuid, uuid, uuid[]) TO authenticated;
