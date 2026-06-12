-- Permisos mínimos para el frontend (anon key).
-- En Supabase cloud existen grants por defecto; en local hay que declararlos.
-- Las tablas con RLS (clientes, turnos) siguen protegidas por sus policies.

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Catálogo: solo lectura
GRANT SELECT ON sucursales, servicios, profesionales, profesional_servicios
  TO anon, authenticated;

-- Operatoria de reserva y agenda
GRANT SELECT, INSERT, UPDATE ON clientes, turnos TO anon, authenticated;
