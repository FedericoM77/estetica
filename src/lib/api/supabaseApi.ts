import type { SupabaseClient } from '@supabase/supabase-js'
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns'
import { supabase } from '../supabase'
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

/** Código Postgres de violación de unique constraint. */
const UNIQUE_VIOLATION = '23505'
/** Código Postgres de violación de foreign key (fila referenciada). */
const FOREIGN_KEY_VIOLATION = '23503'

function client(): SupabaseClient {
  if (!supabase) {
    throw new Error('Cliente Supabase no inicializado: faltan credenciales en .env')
  }
  return supabase
}

export const supabaseApi: DataApi = {
  async getServicios(): Promise<Servicio[]> {
    const { data, error } = await client()
      .from('servicios')
      .select('*')
      .eq('activo', true)
      .order('nombre')
    if (error) throw error
    return (data ?? []) as Servicio[]
  },

  async getProfesionales(servicioId: string | null): Promise<Profesional[]> {
    let query = client()
      .from('profesionales')
      .select(servicioId ? '*, profesional_servicios!inner(servicio_id)' : '*')
      .eq('activo', true)
    if (servicioId) {
      query = query.eq('profesional_servicios.servicio_id', servicioId)
    }
    const { data, error } = await query.order('nombre')
    if (error) throw error
    return (data ?? []) as unknown as Profesional[]
  },

  async getTurnosOcupados(
    profesionalId: string,
    desdeIso: string,
    hastaIso: string,
  ): Promise<TurnoOcupado[]> {
    const { data, error } = await client()
      .from('turnos')
      .select('fecha_hora, servicios(duracion_minutos)')
      .eq('profesional_id', profesionalId)
      .neq('estado', 'CANCELADO')
      .gte('fecha_hora', desdeIso)
      .lte('fecha_hora', hastaIso)
    if (error) throw error

    interface Row {
      fecha_hora: string
      servicios: { duracion_minutos: number } | null
    }
    return ((data ?? []) as unknown as Row[]).map((row) => ({
      fechaHora: row.fecha_hora,
      duracionMinutos: row.servicios?.duracion_minutos ?? 60,
    }))
  },

  async crearTurno(input: CrearTurnoInput): Promise<CrearTurnoResult> {
    // 1. Upsert manual de cliente por teléfono
    const telefono = input.cliente.telefono.trim()
    const { data: existentes, error: errorBusqueda } = await client()
      .from('clientes')
      .select('*')
      .eq('telefono', telefono)
      .limit(1)
    if (errorBusqueda) throw errorBusqueda

    let cliente_: Cliente
    if (existentes && existentes.length > 0) {
      const { data: actualizado, error: errorUpdate } = await client()
        .from('clientes')
        .update({ nombre: input.cliente.nombre.trim(), email: input.cliente.email.trim() })
        .eq('id', (existentes[0] as Cliente).id)
        .select()
        .single()
      if (errorUpdate) throw errorUpdate
      cliente_ = actualizado as Cliente
    } else {
      const { data: creado, error: errorInsert } = await client()
        .from('clientes')
        .insert({
          nombre: input.cliente.nombre.trim(),
          telefono,
          email: input.cliente.email.trim(),
        })
        .select()
        .single()
      if (errorInsert) throw errorInsert
      cliente_ = creado as Cliente
    }

    // 2. Insert del turno; la constraint unique_profesional_agenda
    // es la defensa real contra doble reserva
    const { data: turno, error: errorTurno } = await client()
      .from('turnos')
      .insert({
        cliente_id: cliente_.id,
        profesional_id: input.profesionalId,
        servicio_id: input.servicioId,
        fecha_hora: input.fechaHora,
        estado: 'CONFIRMADO',
        notas: input.notas ?? null,
      })
      .select()
      .single()

    if (errorTurno) {
      if (errorTurno.code === UNIQUE_VIOLATION) throw new SlotOcupadoError()
      throw errorTurno
    }

    return { turno: turno as Turno, cliente: cliente_ }
  },

  async getTurnosDetalle(filtros: FiltrosTurnos): Promise<TurnoDetalle[]> {
    let query = client()
      .from('turnos')
      .select('*, cliente:clientes(*), profesional:profesionales(*), servicio:servicios(*)')
      .gte('fecha_hora', filtros.desde)
      .lt('fecha_hora', filtros.hasta)
      .order('fecha_hora')
    if (filtros.profesionalId) query = query.eq('profesional_id', filtros.profesionalId)
    if (filtros.estado) query = query.eq('estado', filtros.estado)

    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as unknown as TurnoDetalle[]
  },

  async updateEstadoTurno(turnoId: string, estado: EstadoTurno): Promise<void> {
    const { error } = await client().from('turnos').update({ estado }).eq('id', turnoId)
    if (error) throw error
  },

  async getTurnosDeCliente(clienteId: string): Promise<TurnoDetalle[]> {
    const { data, error } = await client()
      .from('turnos')
      .select('*, cliente:clientes(*), profesional:profesionales(*), servicio:servicios(*)')
      .eq('cliente_id', clienteId)
      .order('fecha_hora', { ascending: false })
    if (error) throw error
    return (data ?? []) as unknown as TurnoDetalle[]
  },

  // ── ABM ────────────────────────────────────────────────────

  async getSucursales(): Promise<Sucursal[]> {
    const { data, error } = await client().from('sucursales').select('*').order('nombre')
    if (error) throw error
    return (data ?? []) as Sucursal[]
  },

  async getServiciosAdmin(): Promise<Servicio[]> {
    const { data, error } = await client().from('servicios').select('*').order('nombre')
    if (error) throw error
    return (data ?? []) as Servicio[]
  },

  async crearServicio(input: ServicioInput): Promise<Servicio> {
    const { data, error } = await client()
      .from('servicios')
      .insert({
        nombre: input.nombre.trim(),
        descripcion: input.descripcion?.trim() || null,
        duracion_minutos: input.duracion_minutos,
        precio: input.precio,
        precio_desde: input.precio_desde,
        activo: input.activo,
      })
      .select()
      .single()
    if (error) throw error
    return data as Servicio
  },

  async actualizarServicio(id: string, input: ServicioInput): Promise<Servicio> {
    const { data, error } = await client()
      .from('servicios')
      .update({
        nombre: input.nombre.trim(),
        descripcion: input.descripcion?.trim() || null,
        duracion_minutos: input.duracion_minutos,
        precio: input.precio,
        precio_desde: input.precio_desde,
        activo: input.activo,
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Servicio
  },

  async eliminarServicio(id: string): Promise<void> {
    const { error } = await client().from('servicios').delete().eq('id', id)
    if (error) {
      if (error.code === FOREIGN_KEY_VIOLATION) {
        throw new Error(
          'No se puede eliminar: el tratamiento tiene turnos. Desactivalo en su lugar.',
        )
      }
      throw error
    }
  },

  async getProfesionalesAdmin(): Promise<ProfesionalConServicios[]> {
    const { data, error } = await client()
      .from('profesionales')
      .select('*, profesional_servicios(servicio_id)')
      .order('nombre')
    if (error) throw error

    interface Row extends Profesional {
      profesional_servicios: { servicio_id: string }[] | null
    }
    return ((data ?? []) as unknown as Row[]).map((row) => {
      const { profesional_servicios, ...prof } = row
      return {
        ...(prof as Profesional),
        servicioIds: (profesional_servicios ?? []).map((ps) => ps.servicio_id),
      }
    })
  },

  async crearProfesional(input: ProfesionalInput): Promise<Profesional> {
    const { data, error } = await client()
      .from('profesionales')
      .insert({
        sucursal_id: input.sucursal_id,
        nombre: input.nombre.trim(),
        especialidad: input.especialidad.trim(),
        activo: input.activo,
      })
      .select()
      .single()
    if (error) throw error
    const profesional = data as Profesional
    await reemplazarServiciosDeProfesional(profesional.id, input.servicioIds)
    return profesional
  },

  async actualizarProfesional(id: string, input: ProfesionalInput): Promise<Profesional> {
    const { data, error } = await client()
      .from('profesionales')
      .update({
        sucursal_id: input.sucursal_id,
        nombre: input.nombre.trim(),
        especialidad: input.especialidad.trim(),
        activo: input.activo,
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    await reemplazarServiciosDeProfesional(id, input.servicioIds)
    return data as Profesional
  },

  async eliminarProfesional(id: string): Promise<void> {
    const { error } = await client().from('profesionales').delete().eq('id', id)
    if (error) {
      if (error.code === FOREIGN_KEY_VIOLATION) {
        throw new Error(
          'No se puede eliminar: el esteticista tiene turnos. Desactivalo en su lugar.',
        )
      }
      throw error
    }
  },

  async getMetricas(): Promise<Metricas> {
    const ahora = new Date()
    const semDesde = startOfWeek(ahora, { weekStartsOn: 1 }).toISOString()
    const semHasta = endOfWeek(ahora, { weekStartsOn: 1 }).toISOString()

    // Turnos de la semana con relaciones: base para la mayoría de las métricas.
    const { data: turnosSemRaw, error: errorSemana } = await client()
      .from('turnos')
      .select('*, cliente:clientes(*), profesional:profesionales(*), servicio:servicios(*)')
      .gte('fecha_hora', semDesde)
      .lte('fecha_hora', semHasta)
      .order('fecha_hora')
    if (errorSemana) throw errorSemana
    const turnosSemana = (turnosSemRaw ?? []) as unknown as TurnoDetalle[]

    const hoyDesde = startOfDay(ahora).toISOString()
    const hoyHasta = endOfDay(ahora).toISOString()
    const turnosHoy = turnosSemana.filter(
      (t) => t.fecha_hora >= hoyDesde && t.fecha_hora <= hoyHasta,
    ).length

    const conteoPorServicio = new Map<string, { nombre: string; cantidad: number }>()
    for (const t of turnosSemana) {
      if (t.estado === 'CANCELADO') continue
      const prev = conteoPorServicio.get(t.servicio_id)
      conteoPorServicio.set(t.servicio_id, {
        nombre: t.servicio?.nombre ?? '—',
        cantidad: (prev?.cantidad ?? 0) + 1,
      })
    }
    const topServicios = [...conteoPorServicio.values()]
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5)

    const { data: proxRaw, error: errorProx } = await client()
      .from('turnos')
      .select('*, cliente:clientes(*), profesional:profesionales(*), servicio:servicios(*)')
      .eq('estado', 'CONFIRMADO')
      .gte('fecha_hora', ahora.toISOString())
      .order('fecha_hora')
      .limit(5)
    if (errorProx) throw errorProx

    const [esteticistas, tratamientos] = await Promise.all([
      client().from('profesionales').select('id', { count: 'exact', head: true }).eq('activo', true),
      client().from('servicios').select('id', { count: 'exact', head: true }).eq('activo', true),
    ])

    return {
      turnosHoy,
      turnosSemana: turnosSemana.length,
      confirmados: turnosSemana.filter((t) => t.estado === 'CONFIRMADO').length,
      completados: turnosSemana.filter((t) => t.estado === 'COMPLETADO').length,
      cancelados: turnosSemana.filter((t) => t.estado === 'CANCELADO').length,
      esteticistasActivos: esteticistas.count ?? 0,
      tratamientosActivos: tratamientos.count ?? 0,
      topServicios,
      proximosTurnos: (proxRaw ?? []) as unknown as TurnoDetalle[],
    }
  },
}

/** Reemplaza el set de servicios de un profesional (borra y reinserta). */
async function reemplazarServiciosDeProfesional(
  profesionalId: string,
  servicioIds: string[],
): Promise<void> {
  const { error: errorDelete } = await client()
    .from('profesional_servicios')
    .delete()
    .eq('profesional_id', profesionalId)
  if (errorDelete) throw errorDelete

  if (servicioIds.length === 0) return
  const { error: errorInsert } = await client()
    .from('profesional_servicios')
    .insert(servicioIds.map((servicio_id) => ({ profesional_id: profesionalId, servicio_id })))
  if (errorInsert) throw errorInsert
}
