ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_superadmin boolean NOT NULL DEFAULT false;

-- Conta fundadora da operação Prospera. Novos superadmins devem ser marcados
-- explicitamente no banco; usuários comuns nunca recebem o seletor de operação.
UPDATE profiles SET is_superadmin = true WHERE lower(email) = 'contato@filipemedina.com';
