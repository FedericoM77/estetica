-- ============================================================
-- AURUM — Auth + Roles (ADMIN / CLIENTE)
-- Introduce login real con Supabase Auth y autorización por rol.
--
-- Modelo:
--   auth.users  ── 1:1 ──  public.perfiles (rol, cliente_id)
--   perfiles.cliente_id ── refiere la fila en clientes del paciente
--
-- El registro de paciente (auth signup) dispara un trigger que crea
-- su fila en `clientes` y su `perfil` con rol CLIENTE.
-- Los ADMIN se siembran manualmente (ver bloque SEED al final).
-- ============================================================

-- ── Perfiles ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS perfiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  rol        VARCHAR(20) NOT NULL DEFAULT 'CLIENTE' CHECK (rol IN ('ADMIN', 'CLIENTE')),
  nombre     VARCHAR(100) NOT NULL DEFAULT '',
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  creado_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_perfiles_cliente ON perfiles(cliente_id);

-- ── Helper: ¿el usuario actual es ADMIN? ───────────────────
-- SECURITY DEFINER para poder leer perfiles dentro de las policies
-- sin caer en recursión de RLS.
CREATE OR REPLACE FUNCTION public.es_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid() AND rol = 'ADMIN'
  );
$$;

-- Devuelve el cliente_id del usuario autenticado (NULL si es admin/sin cliente).
CREATE OR REPLACE FUNCTION public.cliente_actual()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cliente_id FROM public.perfiles WHERE id = auth.uid();
$$;

-- ── Trigger: alta de paciente al registrarse ───────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nombre   text := COALESCE(NEW.raw_user_meta_data->>'nombre', '');
  v_telefono text := COALESCE(NEW.raw_user_meta_data->>'telefono', '');
  v_rol      text := COALESCE(NEW.raw_user_meta_data->>'rol', 'CLIENTE');
  v_cliente_id uuid := NULL;
BEGIN
  -- Sólo los pacientes obtienen fila en `clientes`.
  IF v_rol = 'CLIENTE' THEN
    INSERT INTO public.clientes (nombre, telefono, email)
    VALUES (v_nombre, v_telefono, NEW.email)
    RETURNING id INTO v_cliente_id;
  END IF;

  INSERT INTO public.perfiles (id, rol, nombre, cliente_id)
  VALUES (NEW.id, v_rol, v_nombre, v_cliente_id);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- RLS por rol
-- Reemplaza las policies permisivas "anon" del MVP guest.
-- ============================================================

ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE profesionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE profesional_servicios ENABLE ROW LEVEL SECURITY;

-- Limpieza de las policies guest previas (si existen).
DROP POLICY IF EXISTS "clientes_select_anon" ON clientes;
DROP POLICY IF EXISTS "clientes_insert_anon" ON clientes;
DROP POLICY IF EXISTS "clientes_update_anon" ON clientes;
DROP POLICY IF EXISTS "turnos_select_anon" ON turnos;
DROP POLICY IF EXISTS "turnos_insert_anon" ON turnos;
DROP POLICY IF EXISTS "turnos_update_anon" ON turnos;

-- Perfiles: cada uno ve/edita el suyo; admin ve todos.
CREATE POLICY "perfiles_select" ON perfiles FOR SELECT
  USING (id = auth.uid() OR public.es_admin());
CREATE POLICY "perfiles_update_own" ON perfiles FOR UPDATE
  USING (id = auth.uid());

-- Catálogo (sucursales, servicios, profesionales, relación):
-- lectura para cualquier autenticado; escritura sólo ADMIN.
CREATE POLICY "catalogo_select_suc" ON sucursales FOR SELECT USING (true);
CREATE POLICY "catalogo_admin_suc" ON sucursales FOR ALL
  USING (public.es_admin()) WITH CHECK (public.es_admin());

CREATE POLICY "catalogo_select_serv" ON servicios FOR SELECT USING (true);
CREATE POLICY "catalogo_admin_serv" ON servicios FOR ALL
  USING (public.es_admin()) WITH CHECK (public.es_admin());

CREATE POLICY "catalogo_select_prof" ON profesionales FOR SELECT USING (true);
CREATE POLICY "catalogo_admin_prof" ON profesionales FOR ALL
  USING (public.es_admin()) WITH CHECK (public.es_admin());

CREATE POLICY "catalogo_select_ps" ON profesional_servicios FOR SELECT USING (true);
CREATE POLICY "catalogo_admin_ps" ON profesional_servicios FOR ALL
  USING (public.es_admin()) WITH CHECK (public.es_admin());

-- Clientes: admin todo; el paciente sólo su propia fila.
CREATE POLICY "clientes_admin" ON clientes FOR ALL
  USING (public.es_admin()) WITH CHECK (public.es_admin());
CREATE POLICY "clientes_select_own" ON clientes FOR SELECT
  USING (id = public.cliente_actual());
CREATE POLICY "clientes_update_own" ON clientes FOR UPDATE
  USING (id = public.cliente_actual());

-- Turnos: admin todo; el paciente sólo los suyos (por cliente_id del perfil).
CREATE POLICY "turnos_admin" ON turnos FOR ALL
  USING (public.es_admin()) WITH CHECK (public.es_admin());
CREATE POLICY "turnos_select_own" ON turnos FOR SELECT
  USING (cliente_id = public.cliente_actual());
CREATE POLICY "turnos_insert_own" ON turnos FOR INSERT
  WITH CHECK (cliente_id = public.cliente_actual());
CREATE POLICY "turnos_update_own" ON turnos FOR UPDATE
  USING (cliente_id = public.cliente_actual());

-- ── Grants ─────────────────────────────────────────────────
-- El front ya no usa la anon key para escribir: todo va autenticado.
GRANT SELECT ON perfiles TO authenticated;
GRANT UPDATE (nombre) ON perfiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON sucursales, servicios, profesionales, profesional_servicios
  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON clientes, turnos TO authenticated;

-- ============================================================
-- SEED de ADMIN para desarrollo local (Supabase Docker)
-- En cloud, crear el admin desde el dashboard de Auth y luego:
--   UPDATE perfiles SET rol='ADMIN' WHERE id = '<uuid del user>';
-- ------------------------------------------------------------
-- Local: insertamos directo en auth.users con password 'admin1234'.
-- Requiere extensión pgcrypto (presente en Supabase local).
-- ============================================================
DO $$
DECLARE
  v_admin_id uuid := '00000000-aaaa-0000-0000-000000000001';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@aurum.local') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    ) VALUES (
      v_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'admin@aurum.local',
      crypt('admin1234', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}',
      '{"nombre":"Administración AURUM","rol":"ADMIN"}',
      now(), now()
    );
    -- El trigger crea el perfil como CLIENTE por defecto sólo si rol no viene;
    -- acá vino rol=ADMIN en metadata, así que el perfil queda ADMIN sin cliente.
  END IF;
END $$;
