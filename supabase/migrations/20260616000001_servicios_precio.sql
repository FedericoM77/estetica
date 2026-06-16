-- ============================================================
-- Servicios: agregar precio a una DB existente.
-- precio NULL = a consultar; precio_desde = TRUE para "desde $X".
-- ============================================================

ALTER TABLE servicios
  ADD COLUMN IF NOT EXISTS precio NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS precio_desde BOOLEAN NOT NULL DEFAULT FALSE;
