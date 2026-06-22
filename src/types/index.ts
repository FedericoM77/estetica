// Tipos derivados del schema de DB (supabase/schema.sql)

export interface Sucursal {
  id: string
  nombre: string
  direccion: string
  creado_at: string
}

export interface SucursalInput {
  nombre: string
  direccion: string
}

export interface Servicio {
  id: string
  nombre: string
  descripcion: string | null
  duracion_minutos: number
  /** Precio en ARS. Null = a consultar. */
  precio: number | null
  /** True cuando el precio es un piso ("desde $X", varía según largo/zona). */
  precio_desde: boolean
  activo: boolean
  creado_at: string
}

export interface Profesional {
  id: string
  sucursal_id: string
  nombre: string
  especialidad: string
  telefono: string | null
  activo: boolean
  creado_at: string
}

export interface Cliente {
  id: string
  nombre: string
  telefono: string
  email: string
  creado_at: string
}

export type EstadoTurno = 'CONFIRMADO' | 'CANCELADO' | 'COMPLETADO'

export interface Turno {
  id: string
  cliente_id: string
  profesional_id: string
  servicio_id: string
  fecha_hora: string
  estado: EstadoTurno
  notas: string | null
  creado_at: string
}

/** Turno con sus relaciones embebidas (joins de PostgREST). */
export interface TurnoDetalle extends Turno {
  cliente: Cliente
  profesional: Profesional
  servicio: Servicio
}

/** Datos del paciente capturados en el paso de confirmación. */
export interface DatosCliente {
  nombre: string
  telefono: string
  email: string
}

export type MedioPagoReserva = 'LOCAL' | 'TRANSFERENCIA' | 'MERCADO_PAGO'

// ── Auth / Roles ──────────────────────────────────────────────

export type Rol = 'ADMIN' | 'CLIENTE'

/** Usuario autenticado, ya resuelto con su rol y (si paciente) su cliente_id. */
export interface Usuario {
  id: string
  email: string
  rol: Rol
  nombre: string
  /** Sólo pacientes: id de su fila en `clientes`. Null para admin. */
  clienteId: string | null
}

// ── Inputs de ABM (panel admin) ───────────────────────────────

/** Alta/edición de un tratamiento (servicio). */
export interface ServicioInput {
  nombre: string
  descripcion: string | null
  duracion_minutos: number
  precio: number | null
  precio_desde: boolean
  activo: boolean
}

/** Alta/edición de un esteticista (profesional) + sus tratamientos. */
export interface ProfesionalInput {
  sucursal_id: string
  nombre: string
  especialidad: string
  telefono: string
  activo: boolean
  /** Ids de servicios que realiza. */
  servicioIds: string[]
}

/** Profesional con los ids de servicios que tiene asignados. */
export interface ProfesionalConServicios extends Profesional {
  servicioIds: string[]
}

// ── Métricas del dashboard ────────────────────────────────────

export interface Metricas {
  turnosHoy: number
  turnosSemana: number
  confirmados: number
  completados: number
  cancelados: number
  esteticistasActivos: number
  tratamientosActivos: number
  /** Ranking de servicios por cantidad de turnos (no cancelados). */
  topServicios: { nombre: string; cantidad: number }[]
  /** Próximos turnos confirmados, ordenados por fecha. */
  proximosTurnos: TurnoDetalle[]
}

/** Slot de agenda generado para un día/profesional. */
export interface Slot {
  /** ISO string del inicio del slot */
  fechaHora: string
  /** Etiqueta legible, ej. "09:30" */
  label: string
  disponible: boolean
}
