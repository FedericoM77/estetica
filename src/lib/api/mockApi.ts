// Implementación demo de la capa de datos sobre mockDb (localStorage).
// CADA VISITANTE VE SU PROPIA BASE — solo sirve para demo/preview.

import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns'
import type {
  Cliente,
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
import {
  SlotOcupadoError,
  type CrearTurnoInput,
  type CrearTurnoResult,
  type DataApi,
  type FiltrosTurnos,
  type TurnoOcupado,
} from './types'
import { delay, guardarDb, leerDb, nuevoId, type MockDb } from './mockDb'

function duracionDeServicio(db: MockDb, servicioId: string): number {
  return db.servicios.find((s) => s.id === servicioId)?.duracion_minutos ?? 60
}

function detallar(db: MockDb, t: Turno): TurnoDetalle {
  return {
    ...t,
    cliente: db.clientes.find((c) => c.id === t.cliente_id) as Cliente,
    profesional: db.profesionales.find((p) => p.id === t.profesional_id) as Profesional,
    servicio: db.servicios.find((s) => s.id === t.servicio_id) as Servicio,
  }
}

export const mockApi: DataApi = {
  async getServicios(): Promise<Servicio[]> {
    await delay()
    return leerDb().servicios.filter((s) => s.activo)
  },

  async getProfesionales(servicioId: string | null): Promise<Profesional[]> {
    await delay()
    const db = leerDb()
    const activos = db.profesionales.filter((p) => p.activo)
    if (!servicioId) return activos
    return activos.filter((p) => db.profesionalServicios[p.id]?.includes(servicioId))
  },

  async getTurnosOcupados(
    profesionalId: string,
    desdeIso: string,
    hastaIso: string,
  ): Promise<TurnoOcupado[]> {
    await delay()
    const db = leerDb()
    return db.turnos
      .filter(
        (t) =>
          t.profesional_id === profesionalId &&
          t.estado !== 'CANCELADO' &&
          t.fecha_hora >= desdeIso &&
          t.fecha_hora <= hastaIso,
      )
      .map((t) => ({
        fechaHora: t.fecha_hora,
        duracionMinutos: duracionDeServicio(db, t.servicio_id),
      }))
  },

  async crearTurno(input: CrearTurnoInput): Promise<CrearTurnoResult> {
    await delay()
    const db = leerDb()

    const conflicto = db.turnos.some(
      (t) => t.profesional_id === input.profesionalId && t.fecha_hora === input.fechaHora,
    )
    if (conflicto) throw new SlotOcupadoError()

    const telefono = input.cliente.telefono.trim()
    let cliente = db.clientes.find((c) => c.telefono === telefono)
    if (cliente) {
      cliente.nombre = input.cliente.nombre.trim()
      cliente.email = input.cliente.email.trim()
    } else {
      cliente = {
        id: nuevoId(),
        nombre: input.cliente.nombre.trim(),
        telefono,
        email: input.cliente.email.trim(),
        creado_at: new Date().toISOString(),
      }
      db.clientes.push(cliente)
    }

    const turno: Turno = {
      id: nuevoId(),
      cliente_id: cliente.id,
      profesional_id: input.profesionalId,
      servicio_id: input.servicioId,
      fecha_hora: input.fechaHora,
      estado: 'CONFIRMADO',
      notas: input.notas ?? null,
      creado_at: new Date().toISOString(),
    }
    db.turnos.push(turno)
    guardarDb(db)

    return { turno, cliente }
  },

  async getTurnosDetalle(filtros: FiltrosTurnos): Promise<TurnoDetalle[]> {
    await delay()
    const db = leerDb()
    return db.turnos
      .filter(
        (t) =>
          t.fecha_hora >= filtros.desde &&
          t.fecha_hora < filtros.hasta &&
          (!filtros.profesionalId || t.profesional_id === filtros.profesionalId) &&
          (!filtros.estado || t.estado === filtros.estado),
      )
      .sort((a, b) => a.fecha_hora.localeCompare(b.fecha_hora))
      .map((t) => detallar(db, t))
  },

  async updateEstadoTurno(turnoId: string, estado: EstadoTurno): Promise<void> {
    await delay()
    const db = leerDb()
    const turno = db.turnos.find((t) => t.id === turnoId)
    if (!turno) throw new Error('Turno no encontrado')
    turno.estado = estado
    guardarDb(db)
  },

  async getTurnosDeCliente(clienteId: string): Promise<TurnoDetalle[]> {
    await delay()
    const db = leerDb()
    return db.turnos
      .filter((t) => t.cliente_id === clienteId)
      .sort((a, b) => b.fecha_hora.localeCompare(a.fecha_hora))
      .map((t) => detallar(db, t))
  },

  // ── ABM ────────────────────────────────────────────────────

  async getSucursales(): Promise<Sucursal[]> {
    await delay()
    return leerDb().sucursales
  },

  async getServiciosAdmin(): Promise<Servicio[]> {
    await delay()
    return [...leerDb().servicios].sort((a, b) => a.nombre.localeCompare(b.nombre))
  },

  async crearServicio(input: ServicioInput): Promise<Servicio> {
    await delay()
    const db = leerDb()
    const servicio: Servicio = {
      id: nuevoId(),
      nombre: input.nombre.trim(),
      descripcion: input.descripcion?.trim() || null,
      duracion_minutos: input.duracion_minutos,
      precio: input.precio,
      precio_desde: input.precio_desde,
      activo: input.activo,
      creado_at: new Date().toISOString(),
    }
    db.servicios.push(servicio)
    guardarDb(db)
    return servicio
  },

  async actualizarServicio(id: string, input: ServicioInput): Promise<Servicio> {
    await delay()
    const db = leerDb()
    const servicio = db.servicios.find((s) => s.id === id)
    if (!servicio) throw new Error('Tratamiento no encontrado')
    servicio.nombre = input.nombre.trim()
    servicio.descripcion = input.descripcion?.trim() || null
    servicio.duracion_minutos = input.duracion_minutos
    servicio.precio = input.precio
    servicio.precio_desde = input.precio_desde
    servicio.activo = input.activo
    guardarDb(db)
    return servicio
  },

  async eliminarServicio(id: string): Promise<void> {
    await delay()
    const db = leerDb()
    if (db.turnos.some((t) => t.servicio_id === id)) {
      throw new Error('No se puede eliminar: el tratamiento tiene turnos. Desactivalo en su lugar.')
    }
    db.servicios = db.servicios.filter((s) => s.id !== id)
    for (const profId of Object.keys(db.profesionalServicios)) {
      db.profesionalServicios[profId] = db.profesionalServicios[profId].filter((sid) => sid !== id)
    }
    guardarDb(db)
  },

  async getProfesionalesAdmin(): Promise<ProfesionalConServicios[]> {
    await delay()
    const db = leerDb()
    return [...db.profesionales]
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
      .map((p) => ({ ...p, servicioIds: db.profesionalServicios[p.id] ?? [] }))
  },

  async crearProfesional(input: ProfesionalInput): Promise<Profesional> {
    await delay()
    const db = leerDb()
    const profesional: Profesional = {
      id: nuevoId(),
      sucursal_id: input.sucursal_id,
      nombre: input.nombre.trim(),
      especialidad: input.especialidad.trim(),
      activo: input.activo,
      creado_at: new Date().toISOString(),
    }
    db.profesionales.push(profesional)
    db.profesionalServicios[profesional.id] = [...input.servicioIds]
    guardarDb(db)
    return profesional
  },

  async actualizarProfesional(id: string, input: ProfesionalInput): Promise<Profesional> {
    await delay()
    const db = leerDb()
    const profesional = db.profesionales.find((p) => p.id === id)
    if (!profesional) throw new Error('Esteticista no encontrado')
    profesional.sucursal_id = input.sucursal_id
    profesional.nombre = input.nombre.trim()
    profesional.especialidad = input.especialidad.trim()
    profesional.activo = input.activo
    db.profesionalServicios[id] = [...input.servicioIds]
    guardarDb(db)
    return profesional
  },

  async eliminarProfesional(id: string): Promise<void> {
    await delay()
    const db = leerDb()
    if (db.turnos.some((t) => t.profesional_id === id)) {
      throw new Error('No se puede eliminar: el esteticista tiene turnos. Desactivalo en su lugar.')
    }
    db.profesionales = db.profesionales.filter((p) => p.id !== id)
    delete db.profesionalServicios[id]
    guardarDb(db)
  },

  async getMetricas(): Promise<Metricas> {
    await delay()
    const db = leerDb()
    const ahora = new Date()
    const hoyDesde = startOfDay(ahora).toISOString()
    const hoyHasta = endOfDay(ahora).toISOString()
    const semDesde = startOfWeek(ahora, { weekStartsOn: 1 }).toISOString()
    const semHasta = endOfWeek(ahora, { weekStartsOn: 1 }).toISOString()
    const noCancelados = db.turnos.filter((t) => t.estado !== 'CANCELADO')

    const conteoPorServicio = new Map<string, number>()
    for (const t of noCancelados) {
      conteoPorServicio.set(t.servicio_id, (conteoPorServicio.get(t.servicio_id) ?? 0) + 1)
    }
    const topServicios = [...conteoPorServicio.entries()]
      .map(([servicioId, cantidad]) => ({
        nombre: db.servicios.find((s) => s.id === servicioId)?.nombre ?? '—',
        cantidad,
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5)

    const proximosTurnos = db.turnos
      .filter((t) => t.estado === 'CONFIRMADO' && t.fecha_hora >= ahora.toISOString())
      .sort((a, b) => a.fecha_hora.localeCompare(b.fecha_hora))
      .slice(0, 5)
      .map((t) => detallar(db, t))

    return {
      turnosHoy: db.turnos.filter((t) => t.fecha_hora >= hoyDesde && t.fecha_hora <= hoyHasta).length,
      turnosSemana: db.turnos.filter((t) => t.fecha_hora >= semDesde && t.fecha_hora <= semHasta)
        .length,
      confirmados: db.turnos.filter((t) => t.estado === 'CONFIRMADO').length,
      completados: db.turnos.filter((t) => t.estado === 'COMPLETADO').length,
      cancelados: db.turnos.filter((t) => t.estado === 'CANCELADO').length,
      esteticistasActivos: db.profesionales.filter((p) => p.activo).length,
      tratamientosActivos: db.servicios.filter((s) => s.activo).length,
      topServicios,
      proximosTurnos,
    }
  },
}
