-- PostgreSQL não permite FOR UPDATE no lado anulável de um LEFT JOIN. O
-- estado da roleta é bloqueado primeiro e a ordem do último bloco é lida em
-- seguida, preservando a serialização da distribuição.
CREATE OR REPLACE FUNCTION public.distribuir_recebimento_webhook(p_recebimento_id uuid)
RETURNS TABLE (lead_id uuid, resultado text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recebimento public.recebimentos_webhook%ROWTYPE; v_empreendimento_id uuid; v_incorporadora_id uuid;
  v_organizacao_captadora_id uuid; v_ultima_ordem integer; v_ultimo_bloco_id uuid; v_bloco public.blocos_distribuicao%ROWTYPE;
  v_corretor_id uuid; v_imobiliaria_id uuid; v_lead_id uuid; v_nome text; v_telefone text; v_email text;
BEGIN
  SELECT r.* INTO v_recebimento FROM public.recebimentos_webhook r WHERE r.id = p_recebimento_id FOR UPDATE;
  SELECT i.empreendimento_id, e.incorporadora_id, o.id INTO v_empreendimento_id, v_incorporadora_id, v_organizacao_captadora_id
  FROM public.integracoes_captacao i JOIN public.empreendimentos e ON e.id = i.empreendimento_id
  LEFT JOIN public.organizacoes o ON o.gestora_id = e.gestora_id
  WHERE i.id = v_recebimento.integracao_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Recebimento não encontrado'; END IF;
  IF v_recebimento.status = 'processado' THEN RETURN QUERY SELECT v_recebimento.lead_id, 'processado'; RETURN; END IF;
  v_nome := COALESCE(NULLIF(v_recebimento.payload #>> '{_normalizado,nome}', ''), 'Lead sem nome');
  v_telefone := COALESCE(NULLIF(v_recebimento.payload #>> '{_normalizado,telefone}', ''), 'não informado');
  v_email := NULLIF(v_recebimento.payload #>> '{_normalizado,email}', '');
  INSERT INTO public.estado_distribuicao (empreendimento_id) VALUES (v_empreendimento_id) ON CONFLICT DO NOTHING;
  SELECT ultimo_bloco_id INTO v_ultimo_bloco_id
  FROM public.estado_distribuicao WHERE empreendimento_id = v_empreendimento_id FOR UPDATE;
  IF v_ultimo_bloco_id IS NOT NULL THEN
    SELECT ordem INTO v_ultima_ordem FROM public.blocos_distribuicao WHERE id = v_ultimo_bloco_id;
  END IF;
  SELECT b.* INTO v_bloco FROM public.blocos_distribuicao b
  WHERE b.empreendimento_id = v_empreendimento_id AND b.ativo
    AND (b.tipo = 'house' OR EXISTS (SELECT 1 FROM public.empreendimento_parceiros ep JOIN public.organizacoes o ON o.id = ep.organizacao_id WHERE ep.empreendimento_id = b.empreendimento_id AND ep.ativo AND o.imobiliaria_id = b.imobiliaria_id))
    AND b.ordem > COALESCE(v_ultima_ordem, -1) ORDER BY b.ordem LIMIT 1;
  IF NOT FOUND THEN
    SELECT b.* INTO v_bloco FROM public.blocos_distribuicao b
    WHERE b.empreendimento_id = v_empreendimento_id AND b.ativo
      AND (b.tipo = 'house' OR EXISTS (SELECT 1 FROM public.empreendimento_parceiros ep JOIN public.organizacoes o ON o.id = ep.organizacao_id WHERE ep.empreendimento_id = b.empreendimento_id AND ep.ativo AND o.imobiliaria_id = b.imobiliaria_id))
    ORDER BY b.ordem LIMIT 1;
  END IF;
  IF FOUND AND v_bloco.tipo = 'house' THEN
    SELECT id, imobiliaria_id INTO v_corretor_id, v_imobiliaria_id FROM public.corretores WHERE id = v_bloco.corretor_id AND ativo;
  ELSIF FOUND THEN
    SELECT c.id, c.imobiliaria_id INTO v_corretor_id, v_imobiliaria_id FROM public.fila_roleta f JOIN public.corretores c ON c.id = f.corretor_id
    WHERE f.empreendimento_id = v_empreendimento_id AND f.ativo AND c.ativo AND c.imobiliaria_id = v_bloco.imobiliaria_id
    ORDER BY f.leads_recebidos, f.ordem, f.ultimo_lead NULLS FIRST LIMIT 1 FOR UPDATE OF f;
  END IF;
  INSERT INTO public.leads (incorporadora_id, empreendimento_id, organizacao_captadora_id, imobiliaria_id, corretor_id, nome, telefone, email)
  VALUES (v_incorporadora_id, v_empreendimento_id, v_organizacao_captadora_id, v_imobiliaria_id, v_corretor_id, v_nome, v_telefone, v_email) RETURNING id INTO v_lead_id;
  INSERT INTO public.historico_leads (lead_id, tipo, descricao) VALUES
    (v_lead_id, 'lead_criado', 'Lead recebido pela integração de captação'),
    (v_lead_id, CASE WHEN v_corretor_id IS NULL THEN 'lead_sem_responsavel' ELSE 'lead_distribuido' END, CASE WHEN v_corretor_id IS NULL THEN 'Aguardando configuração ou corretor elegível' ELSE 'Lead distribuído automaticamente pela fila do empreendimento' END);
  IF v_corretor_id IS NULL THEN
    UPDATE public.recebimentos_webhook SET status = 'processado', lead_id = v_lead_id, erro = 'Aguardando distribuição', processado_em = now() WHERE id = p_recebimento_id;
    RETURN QUERY SELECT v_lead_id, 'sem_responsavel'; RETURN;
  END IF;
  INSERT INTO public.fila_roleta (corretor_id, empreendimento_id, leads_recebidos, ultimo_lead) VALUES (v_corretor_id, v_empreendimento_id, 1, now())
  ON CONFLICT (corretor_id, empreendimento_id) DO UPDATE SET leads_recebidos = public.fila_roleta.leads_recebidos + 1, ultimo_lead = now();
  UPDATE public.estado_distribuicao SET ultimo_bloco_id = v_bloco.id, atualizado_em = now() WHERE empreendimento_id = v_empreendimento_id;
  UPDATE public.recebimentos_webhook SET status = 'processado', lead_id = v_lead_id, erro = NULL, processado_em = now() WHERE id = p_recebimento_id;
  RETURN QUERY SELECT v_lead_id, 'processado';
END;
$$;

REVOKE ALL ON FUNCTION public.distribuir_recebimento_webhook(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.distribuir_recebimento_webhook(uuid) TO service_role;
