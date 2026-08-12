-- Atribuição de marketing acompanha o lead desde a entrada e permite
-- comparar campanha, conjunto, anúncio e formulário no cockpit.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS origem jsonb NOT NULL DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_leads_origem_canal ON leads ((origem ->> 'canal'));
CREATE INDEX IF NOT EXISTS idx_leads_origem_campanha_id ON leads ((origem #>> '{campanha,id}'));
