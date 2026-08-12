-- Dados operacionais do cockpit da Gestora, sempre limitados aos empreendimentos
-- que o perfil autenticado pode configurar. Nenhum dado de lead é exposto por
-- consulta direta do navegador.
CREATE OR REPLACE FUNCTION public.listar_distribuicao_operacao()
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT jsonb_build_object(
    'empreendimentos', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', e.id, 'nome', e.nome, 'gestora_id', e.gestora_id) ORDER BY e.nome) FROM empreendimentos e WHERE pode_configurar_empreendimento(e.id)), '[]'::jsonb),
    'house', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', c.id, 'nome', c.nome, 'ativo', c.ativo) ORDER BY c.nome) FROM corretores c JOIN profiles p ON p.id = auth.uid() WHERE c.gestora_id = p.gestora_id OR pode_gerir_operacao()), '[]'::jsonb),
    'imobiliarias', COALESCE((SELECT jsonb_agg(DISTINCT jsonb_build_object('id', i.id, 'organizacao_id', o.id, 'nome', i.nome, 'ativo', i.ativo) ORDER BY jsonb_build_object('id', i.id, 'organizacao_id', o.id, 'nome', i.nome, 'ativo', i.ativo)) FROM imobiliarias i JOIN organizacoes o ON o.imobiliaria_id = i.id JOIN empreendimentos e ON e.incorporadora_id = i.incorporadora_id WHERE pode_configurar_empreendimento(e.id)), '[]'::jsonb),
    'parceiros', COALESCE((SELECT jsonb_agg(jsonb_build_object('empreendimento_id', ep.empreendimento_id, 'organizacao_id', ep.organizacao_id, 'imobiliaria_id', o.imobiliaria_id, 'tipo', ep.tipo, 'ativo', ep.ativo)) FROM empreendimento_parceiros ep JOIN organizacoes o ON o.id = ep.organizacao_id WHERE pode_configurar_empreendimento(ep.empreendimento_id)), '[]'::jsonb),
    'blocos', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', b.id, 'empreendimento_id', b.empreendimento_id, 'tipo', b.tipo, 'corretor_id', b.corretor_id, 'imobiliaria_id', b.imobiliaria_id, 'ordem', b.ordem, 'ativo', b.ativo) ORDER BY b.empreendimento_id, b.ordem) FROM blocos_distribuicao b WHERE pode_configurar_empreendimento(b.empreendimento_id)), '[]'::jsonb),
    'fila', COALESCE((SELECT jsonb_agg(jsonb_build_object('empreendimento_id', f.empreendimento_id, 'corretor_id', f.corretor_id, 'leads_recebidos', f.leads_recebidos, 'ultimo_lead', f.ultimo_lead)) FROM fila_roleta f WHERE pode_configurar_empreendimento(f.empreendimento_id)), '[]'::jsonb),
    'atribuicoes', COALESCE((SELECT jsonb_agg(to_jsonb(x) ORDER BY x.criado_em DESC) FROM (SELECT l.id, l.nome, l.criado_em, l.empreendimento_id, l.corretor_id, c.nome AS corretor_nome FROM leads l LEFT JOIN corretores c ON c.id = l.corretor_id WHERE pode_configurar_empreendimento(l.empreendimento_id) ORDER BY l.criado_em DESC LIMIT 8) x), '[]'::jsonb)
  )
$$;

REVOKE ALL ON FUNCTION public.listar_distribuicao_operacao() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.listar_distribuicao_operacao() TO authenticated;
