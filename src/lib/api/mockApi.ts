// Implementación demo de la capa de datos: catálogo estático y
// clientes/turnos persistidos en localStorage del navegador.
// CADA VISITANTE VE SU PROPIA "BASE" — solo sirve para demo/preview.

import { addDays, set } from 'date-fns'
import type { Cliente, EstadoTurno, Profesional, Servicio, Turno, TurnoDetalle } from '../../types'
import {
  SlotOcupadoError,
  type CrearTurnoInput,
  type CrearTurnoResult,
  type DataApi,
  type FiltrosTurnos,
  type TurnoOcupado,
} from './types'

const STORAGE_KEY = 'aurum-demo-db-v1'
const LATENCIA_MS = 300

const ahora = new Date().toISOString()

// ── Catálogo (espejo del seed de supabase/schema.sql) ──────────

const SUCURSAL_ID = 'a0000000-0000-0000-0000-000000000001'

const servicios: Servicio[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    nombre: 'Limpieza facial profunda',
    descripcion:
      'Higiene facial completa con extracción, exfoliación y máscara según tipo de piel.',
    duracion_minutos: 60,
    activo: true,
    creado_at: ahora,
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    nombre: 'Botox',
    descripcion:
      'Aplicación de toxina botulínica para suavizar líneas de expresión. Incluye evaluación previa.',
    duracion_minutos: 30,
    activo: true,
    creado_at: ahora,
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    nombre: 'Depilación láser',
    descripcion: 'Depilación definitiva con láser de diodo. Sesión por zona.',
    duracion_minutos: 45,
    activo: true,
    creado_at: ahora,
  },
]

const profesionales: Profesional[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    sucursal_id: SUCURSAL_ID,
    nombre: 'Dra. Valentina Soler',
    especialidad: 'Medicina Estética',
    activo: true,
    creado_at: ahora,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    sucursal_id: SUCURSAL_ID,
    nombre: 'Lic. Camila Funes',
    especialidad: 'Cosmetología',
    activo: true,
    creado_at: ahora,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    sucursal_id: SUCURSAL_ID,
    nombre: 'Téc. Julieta Ramos',
    especialidad: 'Depilación Láser',
    activo: true,
    creado_at: ahora,
  },
]

const profesionalServicios: Record<string, string[]> = {
  'c0000000-0000-0000-0000-000000000001': [
    'b0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
  ],
  'c0000000-0000-0000-0000-000000000002': ['b0000000-0000-0000-0000-000000000001'],
  'c0000000-0000-0000-0000-000000000003': ['b0000000-0000-0000-0000-000000000003'],
}

// ── Estado mutable (clientes + turnos) en localStorage ─────────

interface MockDb {
  clientes: Cliente[]
  turnos: Turno[]
}

function aLas(dia: Date, hora: number): string {
  return set(dia, { hours: hora, minutes: 0, seconds: 0, milliseconds: 0 }).toISOString()
}

function seedInicial(): MockDb {
  const hoy = new Date()
  const clientes: Cliente[] = [
    {
      id: 'd0000000-0000-0000-0000-000000000001',
      nombre: 'María González',
      telefono: '+5491155551111',
      email: 'maria.gonzalez@example.com',
      creado_at: ahora,
    },
    {
      id: 'd0000000-0000-0000-0000-000000000002',
      nombre: 'Lucía Pereyra',
      telefono: '+5491155552222',
      email: 'lucia.pereyra@example.com',
      creado_at: ahora,
    },
  ]
  const turnos: Turno[] = [
    {
      id: 'e0000000-0000-0000-0000-000000000001',
      cliente_id: clientes[0].id,
      profesional_id: profesionales[0].id,
      servicio_id: 'b0000000-0000-0000-0000-000000000002',
      fecha_hora: aLas(addDays(hoy, 1), 10),
      estado: 'CONFIRMADO',
      notas: null,
      creado_at: ahora,
    },
    {
      id: 'e0000000-0000-0000-0000-000000000002',
      cliente_id: clientes[1].id,
      profesional_id: profesionales[1].id,
      servicio_id: 'b0000000-0000-0000-0000-000000000001',
      fecha_hora: aLas(addDays(hoy, 1), 15),
      estado: 'CONFIRMADO',
      notas: null,
      creado_at: ahora,
    },
    {
      id: 'e0000000-0000-0000-0000-000000000003',
      cliente_id: clientes[0].id,
      profesional_id: profesionales[2].id,
      servicio_id: 'b0000000-0000-0000-0000-000000000003',
      fecha_hora: aLas(addDays(hoy, 2), 11),
      estado: 'CONFIRMADO',
      notas: null,
      creado_at: ahora,
    },
    {
      id: 'e0000000-0000-0000-0000-000000000004',
      cliente_id: clientes[1].id,
      profesional_id: profesionales[0].id,
      servicio_id: 'b0000000-0000-0000-0000-000000000002',
      fecha_hora: aLas(addDays(hoy, -1), 12),
      estado: 'COMPLETADO',
      notas: null,
      creado_at: ahora,
    },
  ]
  return { clientes, turnos }
}

function leerDb(): MockDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as MockDb
  } catch {
    // storage corrupto o inaccesible: re-seedear
  }
  const db = seedInicial()
  guardarDb(db)
  return db
}

function guardarDb(db: MockDb): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // sin storage (modo incógnito estricto): la demo sigue en memoria
  }
}

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCIA_MS))
}

function nuevoId(): string {
  return crypto.randomUUID()
}

function duracionDeServicio(servicioId: string): number {
  return servicios.find((s) => s.id === servicioId)?.duracion_minutos ?? 60
}

// ── API ────────────────────────────────────────────────────────

export const mockApi: DataApi = {
  async getServicios(): Promise<Servicio[]> {
    await delay()
    return servicios
  },

  async getProfesionales(servicioId: string | null): Promise<Profesional[]> {
    await delay()
    if (!servicioId) return profesionales
    return profesionales.filter((p) => profesionalServicios[p.id]?.includes(servicioId))
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
        duracionMinutos: duracionDeServicio(t.servicio_id),
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
      .map((t) => ({
        ...t,
        cliente: db.clientes.find((c) => c.id === t.cliente_id) as Cliente,
        profesional: profesionales.find((p) => p.id === t.profesional_id) as Profesional,
        servicio: servicios.find((s) => s.id === t.servicio_id) as Servicio,
      }))
  },

  async updateEstadoTurno(turnoId: string, estado: EstadoTurno): Promise<void> {
    await delay()
    const db = leerDb()
    const turno = db.turnos.find((t) => t.id === turnoId)
    if (!turno) throw new Error('Turno no encontrado')
    turno.estado = estado
    guardarDb(db)
  },
}
