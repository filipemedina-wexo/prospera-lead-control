-- RLS do MVP: a carteira do corretor e a operação da gestora não podem vazar
-- para outros usuários do mesmo tenant.

CREATE OR REPLACE FUNCTION pode_acessar_lead(p_lead_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM leads l
    JOIN profiles p ON p.id = auth.uid()
    LEFT JOIN empreendimentos e ON e.id = l.empreendimento_id
    WHERE l.id = p_lead_id
      AND (
        (p.role = 'incorporadora' AND p.incorporadora_id = l.incorporadora_id)
        OR (p.role = 'gestora_lancamentos' AND p.gestora_id IS NOT NULL AND p.gestora_id = e.gestora_id)
        OR (p.role = 'imobiliaria' AND p.imobiliaria_id IS NOT NULL AND p.imobiliaria_id = l.imobiliaria_id)
        OR (p.role = 'corretor' AND p.corretor_id IS NOT NULL AND p.corretor_id = l.corretor_id)
      )
  )
$$;

REVOKE ALL ON FUNCTION pode_acessar_lead(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION pode_acessar_lead(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "leads_select" ON leads;
DROP POLICY IF EXISTS "leads_insert" ON leads;
DROP POLICY IF EXISTS "leads_update" ON leads;
DROP POLICY IF EXISTS "leads_delete" ON leads;

CREATE POLICY "leads_select_by_operational_scope" ON leads
  FOR SELECT USING (pode_acessar_lead(id));

-- Inserção, transferência e exclusão são operações de servidor auditadas.
-- O cliente somente atualiza leads que já pertencem ao seu escopo.
CREATE POLICY "leads_update_by_operational_scope" ON leads
  FOR UPDATE USING (pode_acessar_lead(id)) WITH CHECK (pode_acessar_lead(id));

DROP POLICY IF EXISTS "historico_leads_select" ON historico_leads;
DROP POLICY IF EXISTS "historico_leads_insert" ON historico_leads;
DROP POLICY IF EXISTS "historico_leads_update" ON historico_leads;
DROP POLICY IF EXISTS "historico_leads_delete" ON historico_leads;

CREATE POLICY "historico_leads_select_by_operational_scope" ON historico_leads
  FOR SELECT USING (pode_acessar_lead(lead_id));

DROP POLICY IF EXISTS "leituras_lead_select" ON leituras_lead;
DROP POLICY IF EXISTS "leituras_lead_upsert_own" ON leituras_lead;

CREATE POLICY "leituras_lead_select_by_operational_scope" ON leituras_lead
  FOR SELECT USING (pode_acessar_lead(lead_id));

CREATE POLICY "leituras_lead_upsert_own_on_accessible_lead" ON leituras_lead
  FOR ALL
  USING (profile_id = auth.uid() AND pode_acessar_lead(lead_id))
  WITH CHECK (profile_id = auth.uid() AND pode_acessar_lead(lead_id));
