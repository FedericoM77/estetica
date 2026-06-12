import type {
  Cliente,
  DatosCliente,
  EstadoTurno,
  Profesional,
  Servicio,
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
}
