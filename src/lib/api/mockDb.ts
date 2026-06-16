// "Base de datos" del modo demo, persistida en localStorage del navegador.
// Compartida por mockApi (datos) y mockAuth (usuarios) para que un paciente
// registrado en la demo quede ligado a su fila en `clientes`, y para que el
// ABM del admin mute el catálogo que ve el paciente al reservar.
//
// CADA VISITANTE VE SU PROPIA BASE — solo sirve para demo/preview.
// Las contraseñas se guardan en claro: aceptable SOLO en demo sin backend.

import { addDays, set } from 'date-fns'
import type { Cliente, Profesional, Rol, Servicio, Sucursal, Turno } from '../../types'

const STORAGE_KEY = 'aurum-demo-db-v2'

/** Usuario del modo demo (equivale a una fila de auth.users + perfiles). */
export interface MockUsuario {
  id: string
  email: string
  /** En claro: demo sin backend. Nunca replicar este patrón con datos reales. */
  password: string
  rol: Rol
  nombre: string
  clienteId: string | null
}

export interface MockDb {
  sucursales: Sucursal[]
  servicios: Servicio[]
  profesionales: Profesional[]
  /** profesional_id -> servicio_ids que realiza. */
  profesionalServicios: Record<string, string[]>
  clientes: Cliente[]
  turnos: Turno[]
  usuarios: MockUsuario[]
}

const SUCURSAL_ID = 'a0000000-0000-0000-0000-000000000001'

function aLas(dia: Date, hora: number): string {
  return set(dia, { hours: hora, minutes: 0, seconds: 0, milliseconds: 0 }).toISOString()
}

function seedInicial(): MockDb {
  const ahora = new Date().toISOString()
  const hoy = new Date()

  const sucursales: Sucursal[] = [
    {
      id: SUCURSAL_ID,
      nombre: 'AURUM Recoleta',
      direccion: 'Av. Callao 1234, CABA',
      creado_at: ahora,
    },
  ]

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

  const clientes: Cliente[] = [
    {
      id: 'd0000000-0000-0000-0000-000000000001',
      nombre: 'María González',
      telefono: '+5491155551111',
      email: 'cliente@demo.com',
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

  const usuarios: MockUsuario[] = [
    {
      id: '00000000-aaaa-0000-0000-000000000001',
      email: 'admin@demo.com',
      password: '1234',
      rol: 'ADMIN',
      nombre: 'Administración AURUM',
      clienteId: null,
    },
    {
      id: '00000000-cccc-0000-0000-000000000001',
      email: 'cliente@demo.com',
      password: '1234',
      rol: 'CLIENTE',
      nombre: 'María González',
      clienteId: clientes[0].id,
    },
  ]

  return {
    sucursales,
    servicios,
    profesionales,
    profesionalServicios,
    clientes,
    turnos,
    usuarios,
  }
}

export function leerDb(): MockDb {
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

export function guardarDb(db: MockDb): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // sin storage (incógnito estricto): la demo sigue en memoria del proceso
  }
}

export function nuevoId(): string {
  return crypto.randomUUID()
}

export const LATENCIA_MS = 300

export function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCIA_MS))
}
