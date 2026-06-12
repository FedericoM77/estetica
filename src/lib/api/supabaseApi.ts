import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import type { Cliente, EstadoTurno, Profesional, Servicio, Turno, TurnoDetalle } from '../../types'
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
}
