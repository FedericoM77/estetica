# AURUM — Turnos Online (MVP)

Sistema de reserva de turnos para centro de estética. React + Vite + TypeScript + Tailwind v4 + Supabase. Sin pago en el MVP: el turno se confirma directo.

## Autenticación (login doble)

El acceso requiere login y hay **dos roles**:

- **Paciente** (`/ingresar`): login + registro (email y contraseña, alta inmediata sin confirmación por mail). Tras ingresar accede al flujo de reserva (`/`) y a sus turnos (`/mis-turnos`).
- **Admin** (`/admin/login`): equipo del centro. Accede al panel `/admin` con dashboard, ABM de esteticistas y tratamientos, agenda de turnos y sucursales.

El catálogo que ve el paciente al reservar sale del ABM del admin: dar de alta/baja un tratamiento o esteticista cambia lo que se ofrece en la reserva.

La capa de auth vive en `src/lib/auth/` (contrato `AuthApi`, implementaciones `supabaseAuth` y `mockAuth`), espejo del patrón de `src/lib/api/`.

## Modo demo (sin Supabase)

Si faltan las credenciales de Supabase (o con `VITE_USE_MOCKS=true`), la app corre en **modo demo**: catálogo y usuarios mockeados en localStorage del navegador. Badge "Demo" en el header.

Usuarios sembrados en demo:

- Admin: `admin@demo.com` / `1234`
- Paciente: `cliente@demo.com` / `1234`

**Limitación clave:** cada visitante ve su propia "base" local — no hay agenda compartida ni reservas reales. Sirve para preview/demo del producto, no para operar. El deploy a GitHub Pages usa este modo si no se configuran los secrets `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`; al agregarlos, el próximo deploy vuelve a datos reales.

La selección de implementación vive en `src/lib/api/` (contrato `DataApi`, implementaciones `supabaseApi` y `mockApi`).

## Setup

1. **Supabase**: crear un proyecto en [supabase.com](https://supabase.com) y ejecutar **en orden** en el SQL Editor:
   1. `supabase/schema.sql` (DDL + seed de catálogo).
   2. `supabase/migrations/20260616000000_auth_roles.sql` (tabla `perfiles`, trigger de alta de paciente, RLS por rol y seed de admin local).

   Además, en **Authentication → Providers → Email**, desactivar "Confirm email" para que el registro de paciente deje la sesión iniciada de inmediato. El admin se crea desde el dashboard de Auth (o queda sembrado en local) y se marca con `UPDATE perfiles SET rol='ADMIN' WHERE id='<uuid>'`.

2. **Variables de entorno**: copiar `.env.example` a `.env` y completar:
   - `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (Settings → API del proyecto Supabase).
   - Las variables de WhatsApp pueden quedar vacías — el módulo es un stub en el MVP.

3. **Correr**:

   ```bash
   npm install
   npm run dev
   ```

## Rutas

Públicas: `/ingresar` (login/registro paciente) · `/admin/login` (login admin).

Paciente (rol CLIENTE): `/` reserva (4 pasos) · `/mis-turnos`.

Admin (rol ADMIN): `/admin` dashboard · `/admin/turnos` agenda · `/admin/esteticistas` ABM · `/admin/tratamientos` ABM · `/admin/sucursales`.

## Estructura

```
src/
├── components/
│   ├── ui/         # Button, Card, Badge, Input, Spinner
│   ├── booking/    # Stepper + pasos del flujo de reserva
│   ├── admin/      # AdminLayout (sidebar), ManualTurnoForm
│   ├── auth/       # ProtectedRoute, AuthLayout
│   └── layout/     # Header, Footer, PageWrapper
├── pages/          # IngresarPage, AdminLoginPage, BookingPage, MisTurnosPage
│   └── admin/      # Dashboard, Turnos, Esteticistas, Tratamientos, Sucursales
├── hooks/          # useAuth, useMetricas, useAdminServicios, useAdminProfesionales, useMisTurnos, …
├── lib/
│   ├── api/        # DataApi: supabaseApi, mockApi, mockDb (demo)
│   ├── auth/       # AuthApi: supabaseAuth, mockAuth, AuthContext
│   ├── supabase.ts
│   └── whatsapp.ts # stub desacoplado
└── types/          # Tipos derivados del schema
supabase/schema.sql                              # DDL + seed catálogo
supabase/migrations/20260616000000_auth_roles.sql # auth + RLS por rol
```

## Notas de seguridad

- Autorización por RLS **por rol** (ver migración de auth): catálogo de lectura pública; escritura del catálogo, `clientes` y `turnos` ajenos sólo para ADMIN; el paciente sólo accede a sus propios turnos. Helpers `es_admin()` / `cliente_actual()`.
- En **modo demo** las contraseñas se guardan en claro en localStorage: aceptable sólo en demo sin backend, nunca con datos reales.
- La constraint `unique_profesional_agenda` en DB es la defensa real contra doble reserva del mismo horario; el front maneja el conflicto mostrando un error claro. (Pendiente conocido: la constraint sólo cubre coincidencia exacta de horario, no solapamientos de servicios con distinta duración, y los turnos CANCELADO siguen ocupando el slot único — ver análisis de riesgos.)
