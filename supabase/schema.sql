-- ============================================================
-- AURUM — Centro de Estética Avanzada
-- Schema MVP de turnos. Ejecutar en el SQL Editor de Supabase.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sucursales
CREATE TABLE sucursales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  direccion TEXT NOT NULL,
  creado_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Servicios / Tratamientos
CREATE TABLE servicios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  duracion_minutos INTEGER NOT NULL DEFAULT 60,
  activo BOOLEAN DEFAULT TRUE,
  creado_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Profesionales
CREATE TABLE profesionales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sucursal_id UUID NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  especialidad VARCHAR(100) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  creado_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Relación profesional <-> servicios que puede realizar
CREATE TABLE profesional_servicios (
  profesional_id UUID REFERENCES profesionales(id) ON DELETE CASCADE,
  servicio_id UUID REFERENCES servicios(id) ON DELETE CASCADE,
  PRIMARY KEY (profesional_id, servicio_id)
);

-- Clientes / Pacientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(150) NOT NULL,
  creado_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clientes_telefono ON clientes(telefono);
CREATE INDEX idx_clientes_email ON clientes(email);

-- Turnos (entidad core)
CREATE TABLE turnos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  profesional_id UUID NOT NULL REFERENCES profesionales(id) ON DELETE RESTRICT,
  servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE RESTRICT,
  fecha_hora TIMESTAMPTZ NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'CONFIRMADO', -- CONFIRMADO, CANCELADO, COMPLETADO
  notas TEXT,
  creado_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_profesional_agenda UNIQUE(profesional_id, fecha_hora)
);

CREATE INDEX idx_turnos_fecha ON turnos(fecha_hora);
CREATE INDEX idx_turnos_estado ON turnos(estado);

-- ============================================================
-- RLS + Auth por rol (ADMIN / CLIENTE)
-- El login es obligatorio: pacientes y admin se autentican con
-- Supabase Auth. La autorización vive en las policies por rol.
-- Toda la definición (tabla perfiles, trigger de alta, helpers
-- es_admin()/cliente_actual(), policies y grants) está en:
--   supabase/migrations/20260616000000_auth_roles.sql
-- Ejecutar ESTE archivo y luego esa migración (en ese orden).
-- ============================================================

ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- ============================================================
-- SEED de desarrollo
-- ============================================================

INSERT INTO sucursales (id, nombre, direccion) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'AURUM Recoleta', 'Av. Callao 1234, CABA');

INSERT INTO servicios (id, nombre, descripcion, duracion_minutos) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Limpieza facial profunda', 'Higiene facial completa con extracción, exfoliación y máscara según tipo de piel.', 60),
  ('b0000000-0000-0000-0000-000000000002', 'Botox', 'Aplicación de toxina botulínica para suavizar líneas de expresión. Incluye evaluación previa.', 30),
  ('b0000000-0000-0000-0000-000000000003', 'Depilación láser', 'Depilación definitiva con láser de diodo. Sesión por zona.', 45);

INSERT INTO profesionales (id, sucursal_id, nombre, especialidad) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Dra. Valentina Soler', 'Medicina Estética'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Lic. Camila Funes', 'Cosmetología'),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Téc. Julieta Ramos', 'Depilación Láser');

INSERT INTO profesional_servicios (profesional_id, servicio_id) VALUES
  -- Dra. Soler: botox + limpieza
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
  -- Lic. Funes: limpieza facial
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001'),
  -- Téc. Ramos: depilación láser
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003');

INSERT INTO clientes (id, nombre, telefono, email) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'María González', '+5491155551111', 'maria.gonzalez@example.com'),
  ('d0000000-0000-0000-0000-000000000002', 'Lucía Pereyra', '+5491155552222', 'lucia.pereyra@example.com');

-- Turnos de ejemplo relativos a la fecha de ejecución del seed
INSERT INTO turnos (cliente_id, profesional_id, servicio_id, fecha_hora, estado) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002',
    (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '10 hours'), 'CONFIRMADO'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001',
    (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '15 hours'), 'CONFIRMADO'),
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003',
    (CURRENT_DATE + INTERVAL '2 days' + INTERVAL '11 hours'), 'CONFIRMADO'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002',
    (CURRENT_DATE - INTERVAL '1 day' + INTERVAL '12 hours'), 'COMPLETADO');
