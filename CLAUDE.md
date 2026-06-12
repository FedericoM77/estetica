# CLAUDE.md — MVP Turnos Centro de Estética

## Contexto del Proyecto

Sistema de reserva de turnos online para centros de estética. El objetivo del MVP es permitir que un paciente reserve un turno en 3 pasos simples desde cualquier dispositivo, sin intervención del equipo del centro.

**El pago está fuera del scope del MVP.** El turno se confirma directo sin cobro de seña por ahora.

---

## Stack Tecnológico

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Base de datos y Auth:** Supabase (PostgreSQL + PostgREST + RLS)
- **Deploy:** Vercel (free tier)
- **Notificaciones:** Z-API o Evolution API (WhatsApp) — integrar como módulo desacoplado, puede quedar como stub en MVP
- **Testing:** Vitest + React Testing Library

---

## Arquitectura y Estructura de Carpetas

```
/
├── src/
│   ├── components/
│   │   ├── ui/               # Componentes base: Button, Card, Badge, etc.
│   │   ├── booking/          # Flujo de reserva: StepService, StepProfessional, StepDateTime, StepConfirmation
│   │   └── layout/           # Header, Footer, PageWrapper
│   ├── pages/
│   │   ├── BookingPage.tsx   # Página principal del flujo de reserva (paciente)
│   │   └── AdminPage.tsx     # Dashboard del centro (ver/gestionar turnos)
│   ├── lib/
│   │   ├── supabase.ts       # Cliente Supabase inicializado
│   │   └── whatsapp.ts       # Stub del gateway de WhatsApp (desacoplado)
│   ├── hooks/
│   │   ├── useServices.ts
│   │   ├── useProfessionals.ts
│   │   └── useAvailability.ts
│   ├── types/
│   │   └── index.ts          # Tipos TypeScript derivados del schema de DB
│   └── App.tsx
├── supabase/
│   └── schema.sql            # DDL completo listo para ejecutar en Supabase
├── .env.example
└── CLAUDE.md
```

---

## Modelo de Datos (PostgreSQL / Supabase)

Ejecutar en el SQL Editor de Supabase:

```sql
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

-- RLS: habilitar en producción
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
```

**Importante:** Crear datos de seed para desarrollo:
- Al menos 1 sucursal
- 3 servicios (ej: "Limpieza facial", "Botox", "Depilación láser")
- 3 profesionales asociados a esos servicios
- Algunos turnos de ejemplo

---

## Flujo del Paciente (BookingPage)

Stepper de 4 pasos, **sin pago**:

```
[1. Servicio] → [2. Profesional] → [3. Fecha y Hora] → [4. Confirmación]
```

### Paso 1 — Elegir Servicio
- Grid de cards con nombre, descripción y duración del servicio
- Una card seleccionada cambia visualmente (estado activo)

### Paso 2 — Elegir Profesional
- Mostrar solo profesionales que realizan el servicio seleccionado
- Card con nombre, especialidad y foto (placeholder si no hay)
- Si hay un solo profesional, saltar este paso automáticamente

### Paso 3 — Elegir Fecha y Hora
- Calendario mensual para seleccionar día
- Grid de horarios disponibles para ese día y profesional
- Los horarios ocupados (turnos existentes en DB) deben estar deshabilitados
- Horario de atención: 9:00 a 19:00, bloques de la duración del servicio seleccionado

### Paso 4 — Confirmar
- Formulario con: nombre completo, teléfono, email
- Resumen del turno: servicio, profesional, fecha/hora
- Botón "Confirmar turno"
- Al confirmar:
  1. Upsert en tabla `clientes` (buscar por teléfono, crear si no existe)
  2. Insert en tabla `turnos` con estado `CONFIRMADO`
  3. Mostrar pantalla de éxito con resumen y opción de agregar al calendario

---

## Dashboard Admin (AdminPage)

Vista interna del centro de estética. Sin auth en MVP (o auth básica con Supabase).

### Funcionalidades requeridas:
- **Vista de agenda:** tabla o calendario semanal de turnos
- **Filtros:** por profesional, por fecha, por estado
- **Detalle de turno:** nombre paciente, teléfono, servicio, hora
- **Cambiar estado:** botón para marcar turno como CANCELADO o COMPLETADO
- **Carga manual de turno:** form simple para que la recepcionista agregue un turno por teléfono

---

## Diseño Visual — Directivas

**Concepto:** Premium, clínico-moderno. Transmite confianza y sofisticación. No debe parecer una app de turnos genérica — debe sentirse como una marca de salud estética de alto nivel.

**Paleta:**
- Fondo base: `#0F0F0F` (negro cálido, no frío)
- Superficie cards: `#1A1A1A`
- Borde sutil: `#2A2A2A`
- Acento primario: `#C9A96E` (dorado apagado, lujo sin estridencia)
- Acento secundario: `#E8D5B0` (crema para texto sobre acento)
- Texto principal: `#F5F5F0`
- Texto secundario: `#8A8A85`
- Éxito: `#4CAF7D`
- Error: `#E05A5A`

**Tipografía:**
- Display / headings: `Cormorant Garamond` (serif elegante, carga desde Google Fonts)
- Body / UI: `Inter` (legible, moderno)
- El nombre del centro en el header usa Cormorant Garamond en weight 300, tracking amplio

**Estilo de componentes:**
- Border radius: `12px` para cards, `8px` para botones, `4px` para inputs
- Sombras: muy sutiles, tipo `0 1px 3px rgba(0,0,0,0.4)`
- Botón primario: fondo `#C9A96E`, texto `#0F0F0F`, hover ligeramente más claro
- Botón secundario: borde `1px solid #2A2A2A`, fondo transparente
- Cards de selección: borde `1px solid #2A2A2A`, al seleccionar borde `1px solid #C9A96E` + glow sutil `box-shadow: 0 0 0 1px #C9A96E`
- Inputs: fondo `#1A1A1A`, borde `#2A2A2A`, focus borde `#C9A96E`

**Animaciones:**
- Transición entre pasos del stepper: fade + slide horizontal suave (`200ms ease`)
- Hover en cards: `transform: translateY(-2px)` + transición `150ms`
- Sin animaciones excesivas — elegancia por contenido, no por movimiento

**Nombre del centro (placeholder):** `AURUM` — Centro de Estética Avanzada

**Responsive:** Mobile-first. El flujo de reserva debe funcionar perfecto en 375px.

---

## Variables de Entorno (.env.example)

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_WHATSAPP_GATEWAY_URL=https://api.z-api.io/instances/INSTANCE/token/TOKEN
VITE_WHATSAPP_TOKEN=tu-token
```

---

## Convenciones de Código

- TypeScript strict mode activado
- Componentes funcionales con hooks, sin clases
- Custom hooks para toda lógica de datos (no lógica en componentes de UI)
- Manejo de errores explícito en todas las llamadas a Supabase
- No usar `any` salvo en adaptadores de datos externos
- Nombrar estados de loading/error explícitamente: `isLoadingServices`, `errorServices`

---

## Lo que NO está en scope del MVP

- Pago / cobro de seña (se agrega en v2)
- Login de pacientes (reserva como guest)
- Notificaciones WhatsApp automáticas (el módulo existe pero puede ser stub)
- Multi-tenant (un centro por instancia)
- Recordatorios automáticos de turno

---

## Tareas para Claude Code

1. Inicializar proyecto con `npm create vite@latest` (React + TypeScript)
2. Instalar dependencias: `tailwindcss`, `@supabase/supabase-js`, `date-fns`, `react-router-dom`
3. Configurar Tailwind con los tokens de diseño de este documento
4. Crear el `schema.sql` con el DDL completo + seed de desarrollo
5. Implementar el flujo de BookingPage completo (4 pasos)
6. Implementar el AdminPage con agenda semanal y filtros
7. Conectar todo a Supabase con los hooks definidos
8. Asegurarse que el diseño visual siga exactamente las directivas de este documento
