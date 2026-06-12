// Tipos derivados del schema de DB (supabase/schema.sql)

export interface Sucursal {
  id: string
  nombre: string
  direccion: string
  creado_at: string
}

export interface Servicio {
  id: string
  nombre: string
  descripcion: string | null
  duracion_minutos: number
  activo: boolean
  creado_at: string
}

export interface Profesional {
  id: string
  sucursal_id: string
  nombre: string
  especialidad: string
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

/** Slot de agenda generado para un día/profesional. */
export interface Slot {
  /** ISO string del inicio del slot */
  fechaHora: string
  /** Etiqueta legible, ej. "09:30" */
  label: string
  disponible: boolean
}
