-- Align public tables with Neon Auth/Data API access used by the app.
-- This migration is idempotent and matches the live Neon project fix.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION public.sync_neon_auth_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, neon_auth
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.name, ''), split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        email = EXCLUDED.email;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_user_profile_on_neon_auth_user ON neon_auth."user";

CREATE TRIGGER sync_user_profile_on_neon_auth_user
AFTER INSERT OR UPDATE OF name, email ON neon_auth."user"
FOR EACH ROW
EXECUTE FUNCTION public.sync_neon_auth_user_profile();

INSERT INTO public.user_profiles (id, name, email)
SELECT
  u.id,
  COALESCE(NULLIF(u.name, ''), split_part(u.email, '@', 1)),
  u.email
FROM neon_auth."user" u
ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      email = EXCLUDED.email;

DO $$
DECLARE
  user_record record;
  v_workspace_id uuid;
BEGIN
  FOR user_record IN
    SELECT
      u.id,
      COALESCE(NULLIF(u.name, ''), split_part(u.email, '@', 1)) AS display_name
    FROM neon_auth."user" u
  LOOP
    SELECT wm.workspace_id
    INTO v_workspace_id
    FROM public.workspace_members wm
    WHERE wm.user_id = user_record.id
    LIMIT 1;

    IF v_workspace_id IS NULL THEN
      INSERT INTO public.workspaces (name)
      VALUES (user_record.display_name || '''s Workspace')
      RETURNING id INTO v_workspace_id;

      INSERT INTO public.workspace_members (workspace_id, user_id, role)
      VALUES (v_workspace_id, user_record.id, 'admin')
      ON CONFLICT (workspace_id, user_id) DO NOTHING;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM public.funil_etapas fe WHERE fe.workspace_id = v_workspace_id
    ) THEN
      INSERT INTO public.funil_etapas (workspace_id, name, position, is_default)
      VALUES
        (v_workspace_id, 'Base', 0, true),
        (v_workspace_id, 'Lead Mapeado', 1, false),
        (v_workspace_id, 'Tentando Contato', 2, false),
        (v_workspace_id, 'Conexão Iniciada', 3, false),
        (v_workspace_id, 'Desqualificado', 4, false),
        (v_workspace_id, 'Qualificado', 5, false),
        (v_workspace_id, 'Reunião Agendada', 6, false);
    END IF;
  END LOOP;
END;
$$;

GRANT USAGE ON SCHEMA public TO PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO PUBLIC;
