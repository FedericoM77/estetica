import type {
  Cliente,
  DatosCliente,
  EstadoTurno,
  Metricas,
  Profesional,
  ProfesionalConServicios,
  ProfesionalInput,
  Servicio,
  ServicioInput,
  Sucursal,
  Turno,
  TurnoDetalle,
} from '../../types'

/** El horario pedido ya fue tomado (equivale al unique violation de DB). */
export class SlotOcupadoError extends Error {
  constructor() {
    super('Slot ocupado')
    this.name = 'SlotOcupadoError'
  }
}

export interface TurnoOcupado {
  /** ISO string del inicio del turno */
  fechaHora: string
  duracionMinutos: number
}

export interface CrearTurnoInput {
  cliente: DatosCliente
  profesionalId: string
  servicioId: string
  /** ISO string del inicio del turno */
  fechaHora: string
  notas?: string
}

export interface CrearTurnoResult {
  turno: Turno
  cliente: Cliente
}

export interface FiltrosTurnos {
  /** Inicio del rango (inclusive), ISO string */
  desde: string
  /** Fin del rango (exclusive), ISO string */
  hasta: string
  profesionalId: string | null
  estado: EstadoTurno | null
}

/**
 * Contrato de la capa de datos. Dos implementaciones:
 * supabaseApi (real) y mockApi (demo en localStorage).
 */
export interface DataApi {
  getServicios(): Promise<Servicio[]>
  getProfesionales(servicioId: string | null): Promise<Profesional[]>
  /** Turnos no cancelados de un profesional en un rango, con su duración. */
  getTurnosOcupados(
    profesionalId: string,
    desdeIso: string,
    hastaIso: string,
  ): Promise<TurnoOcupado[]>
  /** Lanza SlotOcupadoError si el horario ya fue tomado. */
  crearTurno(input: CrearTurnoInput): Promise<CrearTurnoResult>
  getTurnosDetalle(filtros: FiltrosTurnos): Promise<TurnoDetalle[]>
  updateEstadoTurno(turnoId: string, estado: EstadoTurno): Promise<void>

  // ── Turnos del paciente ─────────────────────────────────────
  /** Turnos (con relaciones) de un cliente, ordenados por fecha desc. */
  getTurnosDeCliente(clienteId: string): Promise<TurnoDetalle[]>

  // ── ABM — catálogo administrado desde el panel ──────────────
  getSucursales(): Promise<Sucursal[]>

  /** Tratamientos incluyendo inactivos (vista admin). */
  getServiciosAdmin(): Promise<Servicio[]>
  crearServicio(input: ServicioInput): Promise<Servicio>
  actualizarServicio(id: string, input: ServicioInput): Promise<Servicio>
  /** Baja física; falla si tiene turnos asociados (usar `activo=false` para baja lógica). */
  eliminarServicio(id: string): Promise<void>

  /** Esteticistas incluyendo inactivos, con sus servicios asignados. */
  getProfesionalesAdmin(): Promise<ProfesionalConServicios[]>
  crearProfesional(input: ProfesionalInput): Promise<Profesional>
  actualizarProfesional(id: string, input: ProfesionalInput): Promise<Profesional>
  eliminarProfesional(id: string): Promise<void>

  // ── Dashboard ───────────────────────────────────────────────
  getMetricas(): Promise<Metricas>
}
