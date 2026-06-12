# AURUM — Turnos Online (MVP)

Sistema de reserva de turnos para centro de estética. React + Vite + TypeScript + Tailwind v4 + Supabase. Sin pago en el MVP: el turno se confirma directo.

## Modo demo (sin Supabase)

Si faltan las credenciales de Supabase (o con `VITE_USE_MOCKS=true`), la app corre en **modo demo**: catálogo mockeado y turnos persistidos en localStorage del navegador. Se indica con un badge "Demo" en el header.

**Limitación clave:** cada visitante ve su propia "base" local — no hay agenda compartida ni reservas reales. Sirve para preview/demo del producto, no para operar. El deploy a GitHub Pages usa este modo si no se configuran los secrets `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`; al agregarlos, el próximo deploy vuelve a datos reales.

La selección de implementación vive en `src/lib/api/` (contrato `DataApi`, implementaciones `supabaseApi` y `mockApi`).

## Setup

1. **Supabase**: crear un proyecto en [supabase.com](https://supabase.com) y ejecutar `supabase/schema.sql` completo en el SQL Editor (incluye DDL, policies RLS y seed de desarrollo).

2. **Variables de entorno**: copiar `.env.example` a `.env` y completar:
   - `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (Settings → API del proyecto Supabase).
   - Las variables de WhatsApp pueden quedar vacías — el módulo es un stub en el MVP.

3. **Correr**:

   ```bash
   npm install
   npm run dev
   ```

## Rutas

- `/` — Flujo de reserva del paciente (4 pasos: servicio → profesional → fecha/hora → confirmación).
- `/admin` — Agenda semanal del centro: filtros por profesional/estado, cambio de estado de turnos y carga manual.

## Estructura

```
src/
├── components/
│   ├── ui/         # Button, Card, Badge, Input, Spinner
│   ├── booking/    # Stepper + pasos del flujo de reserva
│   ├── admin/      # ManualTurnoForm
│   └── layout/     # Header, Footer, PageWrapper
├── pages/          # BookingPage, AdminPage
├── hooks/          # useServices, useProfessionals, useAvailability, useCreateTurno, useTurnos
├── lib/            # supabase.ts, whatsapp.ts (stub desacoplado)
└── types/          # Tipos derivados del schema
supabase/schema.sql # DDL + RLS + seed
```

## Notas de seguridad

- Las policies RLS del schema son permisivas para que el MVP funcione con la anon key (reserva guest + admin sin auth). **Endurecer antes de producción**: auth para `/admin` y restricción de lectura/actualización de `clientes` y `turnos`.
- La constraint `unique_profesional_agenda` en DB es la defensa real contra doble reserva del mismo horario; el front maneja el conflicto mostrando un error claro.
