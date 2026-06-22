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
  precio NUMERIC(10,2),                  -- NULL = a consultar
  precio_desde BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE = "desde $X"
  activo BOOLEAN DEFAULT TRUE,
  creado_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Profesionales
CREATE TABLE profesionales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sucursal_id UUID NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  especialidad VARCHAR(100) NOT NULL,
  telefono VARCHAR(30),
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

-- Catálogo real (lista de precios del centro). precio_desde = TRUE para
-- los que varían según largo/estado del cabello.
INSERT INTO servicios (id, nombre, descripcion, duracion_minutos, precio, precio_desde) VALUES
  -- Peluquería
  ('b0000000-0000-0000-0000-000000000001', 'Corte', NULL, 45, 20000, FALSE),
  ('b0000000-0000-0000-0000-000000000002', 'Tratamientos antifriz', NULL, 90, 40000, TRUE),
  ('b0000000-0000-0000-0000-000000000003', 'Alisados', NULL, 120, 45000, TRUE),
  ('b0000000-0000-0000-0000-000000000004', 'Color', NULL, 90, 40000, TRUE),
  ('b0000000-0000-0000-0000-000000000005', 'Decoloración, mechas, baby lash, balayage', 'Precio final según largo y estado del cabello.', 180, 90000, TRUE),
  ('b0000000-0000-0000-0000-000000000006', 'Tratamientos nutritivos', NULL, 45, 30000, TRUE),
  -- Uñas y pies
  ('b0000000-0000-0000-0000-000000000007', 'Remoción', NULL, 20, 8000, FALSE),
  ('b0000000-0000-0000-0000-000000000008', 'Soft gel', NULL, 90, 28000, FALSE),
  ('b0000000-0000-0000-0000-000000000009', 'Kapping gel', NULL, 75, 24000, FALSE),
  ('b0000000-0000-0000-0000-000000000010', 'Semipermanente', NULL, 60, 20000, FALSE),
  ('b0000000-0000-0000-0000-000000000011', 'Semi pies', NULL, 60, 20000, FALSE),
  ('b0000000-0000-0000-0000-000000000012', 'Pedicuría tradicional', NULL, 45, 25000, FALSE),
  ('b0000000-0000-0000-0000-000000000013', 'Onicomicosis', NULL, 45, 29000, FALSE),
  ('b0000000-0000-0000-0000-000000000014', 'Pedi spa', NULL, 40, 15000, FALSE),
  -- Maquillaje
  ('b0000000-0000-0000-0000-000000000015', 'Maquillaje social', NULL, 60, 70000, FALSE),
  ('b0000000-0000-0000-0000-000000000016', 'Maquillaje novias / 15 años', NULL, 90, 95000, FALSE),
  -- Facial
  ('b0000000-0000-0000-0000-000000000017', 'Limpieza profunda', NULL, 60, 40000, FALSE),
  ('b0000000-0000-0000-0000-000000000018', 'Peeling', NULL, 45, 45000, FALSE),
  ('b0000000-0000-0000-0000-000000000019', 'Dermapen / exosomas', NULL, 60, 55000, FALSE),
  -- Pestañas y cejas
  ('b0000000-0000-0000-0000-000000000020', 'Lifting de pestañas', NULL, 60, 35000, FALSE),
  ('b0000000-0000-0000-0000-000000000021', 'Laminado de cejas', NULL, 45, 35000, FALSE),
  ('b0000000-0000-0000-0000-000000000022', 'Perfilado o tinte de cejas', NULL, 20, 10000, FALSE);

INSERT INTO profesionales (id, sucursal_id, nombre, especialidad, telefono) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Eugenia Ríos', 'Peluquería', '+5491155553001'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Valentina Ruiz', 'Manicura y Pedicura', '+5491155553002'),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Carolina Méndez', 'Maquillaje y Pestañas', '+5491155553003'),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Sofía Aguilar', 'Cosmetología Facial', '+5491155553004');

INSERT INTO profesional_servicios (profesional_id, servicio_id) VALUES
  -- Eugenia: peluquería (1..6)
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003'),
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004'),
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005'),
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006'),
  -- Valentina: uñas y pies (7..14)
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000007'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000008'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000009'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000010'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000011'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000012'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000013'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000014'),
  -- Carolina: maquillaje + pestañas/cejas (15,16,20,21,22)
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000015'),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000016'),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000020'),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000021'),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000022'),
  -- Sofía: facial (17,18,19)
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000017'),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000018'),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000019');

INSERT INTO clientes (id, nombre, telefono, email) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'María González', '+5491155551111', 'maria.gonzalez@example.com'),
  ('d0000000-0000-0000-0000-000000000002', 'Lucía Pereyra', '+5491155552222', 'lucia.pereyra@example.com');

-- Turnos de ejemplo relativos a la fecha de ejecución del seed
INSERT INTO turnos (cliente_id, profesional_id, servicio_id, fecha_hora, estado) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004',
    (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '10 hours'), 'CONFIRMADO'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000010',
    (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '15 hours'), 'CONFIRMADO'),
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000015',
    (CURRENT_DATE + INTERVAL '2 days' + INTERVAL '11 hours'), 'CONFIRMADO'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000017',
    (CURRENT_DATE - INTERVAL '1 day' + INTERVAL '12 hours'), 'COMPLETADO');
