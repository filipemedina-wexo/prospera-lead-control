-- O cockpit da Central Prospera só lê contagens, mas precisa enxergar a
-- operação inteira sem abrir exceções para os demais perfis.
CREATE POLICY "superadmin_leads_select" ON leads
  FOR SELECT USING (pode_gerir_operacao());

CREATE POLICY "superadmin_incorporadoras_select" ON incorporadoras
  FOR SELECT USING (pode_gerir_operacao());

CREATE POLICY "superadmin_imobiliarias_select" ON imobiliarias
  FOR SELECT USING (pode_gerir_operacao());

CREATE POLICY "superadmin_corretores_select" ON corretores
  FOR SELECT USING (pode_gerir_operacao());
