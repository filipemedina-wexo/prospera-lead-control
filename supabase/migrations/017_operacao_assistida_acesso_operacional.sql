-- A Central Prospera pode executar a mesma operação de um perfil assistido.
-- A UI só permite essa troca para superadmin e registra início/fim na tabela
-- operacoes_assistidas; a função abaixo fecha a lacuna no servidor para ações
-- operacionais (leitura, atendimento e atualização de lead) durante essa sessão.
CREATE OR REPLACE FUNCTION public.pode_acessar_lead(p_lead_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT public.pode_gerir_operacao() OR EXISTS (
    SELECT 1
    FROM public.leads l
    JOIN public.profiles p ON p.id = auth.uid()
    LEFT JOIN public.empreendimentos e ON e.id = l.empreendimento_id
    WHERE l.id = p_lead_id
      AND (
        (p.role = 'incorporadora' AND p.incorporadora_id = l.incorporadora_id)
        OR (p.role = 'gestora_lancamentos' AND p.gestora_id IS NOT NULL AND p.gestora_id = e.gestora_id)
        OR (p.role = 'imobiliaria' AND p.imobiliaria_id IS NOT NULL AND p.imobiliaria_id = l.imobiliaria_id)
        OR (p.role = 'corretor' AND p.corretor_id IS NOT NULL AND p.corretor_id = l.corretor_id)
      )
  )
$$;

REVOKE ALL ON FUNCTION public.pode_acessar_lead(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pode_acessar_lead(uuid) TO authenticated, service_role;
