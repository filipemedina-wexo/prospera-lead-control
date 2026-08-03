-- O cadastro inicial precisa ser atômico: cria a incorporadora e o perfil
-- no mesmo gatilho de auth.users, sem depender da ordem entre dois gatilhos.

DROP TRIGGER IF EXISTS on_auth_user_created_incorporadora ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text := COALESCE(NEW.raw_user_meta_data ->> 'role', 'incorporadora');
  v_incorporadora_id uuid;
  v_empresa_nome text;
BEGIN
  IF NEW.raw_user_meta_data ->> 'incorporadora_id' IS NOT NULL THEN
    v_incorporadora_id := (NEW.raw_user_meta_data ->> 'incorporadora_id')::uuid;
  ELSIF v_role = 'incorporadora' THEN
    v_empresa_nome := NULLIF(trim(NEW.raw_user_meta_data ->> 'empresa_nome'), '');

    INSERT INTO incorporadoras (nome)
    VALUES (COALESCE(v_empresa_nome, 'Minha Empresa'))
    RETURNING id INTO v_incorporadora_id;
  END IF;

  INSERT INTO profiles (id, email, nome, role, incorporadora_id)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(trim(NEW.raw_user_meta_data ->> 'nome'), ''),
    v_role,
    v_incorporadora_id
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
