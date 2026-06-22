// "Base de datos" del modo demo, persistida en localStorage del navegador.
// Compartida por mockApi (datos) y mockAuth (usuarios) para que un paciente
// registrado en la demo quede ligado a su fila en `clientes`, y para que el
// ABM del admin mute el catálogo que ve el paciente al reservar.
//
// CADA VISITANTE VE SU PROPIA BASE — solo sirve para demo/preview.
// Las contraseñas se guardan en claro: aceptable SOLO en demo sin backend.

import { addDays, set } from 'date-fns'
import type { Cliente, Profesional, Rol, Servicio, Sucursal, Turno } from '../../types'

const STORAGE_KEY = 'aurum-demo-db-v3'
const TELEFONOS_PROFESIONALES_DEMO: Record<string, string> = {
  'c0000000-0000-0000-0000-000000000001': '+5491155553001',
  'c0000000-0000-0000-0000-000000000002': '+5491155553002',
  'c0000000-0000-0000-0000-000000000003': '+5491155553003',
  'c0000000-0000-0000-0000-000000000004': '+5491155553004',
}

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

  const mkServ = (
    id: string,
    nombre: string,
    precio: number | null,
    precio_desde: boolean,
    duracion_minutos: number,
    descripcion: string | null = null,
  ): Servicio => ({
    id,
    nombre,
    descripcion,
    duracion_minutos,
    precio,
    precio_desde,
    activo: true,
    creado_at: ahora,
  })

  const sid = (n: number) => `b0000000-0000-0000-0000-${String(n).padStart(12, '0')}`

  const servicios: Servicio[] = [
    // Peluquería (precios "desde", dependen del largo)
    mkServ(sid(1), 'Corte', 20000, false, 45),
    mkServ(sid(2), 'Tratamientos antifriz', 40000, true, 90),
    mkServ(sid(3), 'Alisados', 45000, true, 120),
    mkServ(sid(4), 'Color', 40000, true, 90),
    mkServ(
      sid(5),
      'Decoloración, mechas, baby lash, balayage',
      90000,
      true,
      180,
      'Precio final según largo y estado del cabello.',
    ),
    mkServ(sid(6), 'Tratamientos nutritivos', 30000, true, 45),
    // Uñas y pies
    mkServ(sid(7), 'Remoción', 8000, false, 20),
    mkServ(sid(8), 'Soft gel', 28000, false, 90),
    mkServ(sid(9), 'Kapping gel', 24000, false, 75),
    mkServ(sid(10), 'Semipermanente', 20000, false, 60),
    mkServ(sid(11), 'Semi pies', 20000, false, 60),
    mkServ(sid(12), 'Pedicuría tradicional', 25000, false, 45),
    mkServ(sid(13), 'Onicomicosis', 29000, false, 45),
    mkServ(sid(14), 'Pedi spa', 15000, false, 40),
    // Maquillaje
    mkServ(sid(15), 'Maquillaje social', 70000, false, 60),
    mkServ(sid(16), 'Maquillaje novias / 15 años', 95000, false, 90),
    // Facial
    mkServ(sid(17), 'Limpieza profunda', 40000, false, 60),
    mkServ(sid(18), 'Peeling', 45000, false, 45),
    mkServ(sid(19), 'Dermapen / exosomas', 55000, false, 60),
    // Pestañas y cejas
    mkServ(sid(20), 'Lifting de pestañas', 35000, false, 60),
    mkServ(sid(21), 'Laminado de cejas', 35000, false, 45),
    mkServ(sid(22), 'Perfilado o tinte de cejas', 10000, false, 20),
  ]

  const pid = (n: number) => `c0000000-0000-0000-0000-${String(n).padStart(12, '0')}`

  const profesionales: Profesional[] = [
    { id: pid(1), sucursal_id: SUCURSAL_ID, nombre: 'Eugenia Ríos', especialidad: 'Peluquería', telefono: '+5491155553001', activo: true, creado_at: ahora },
    { id: pid(2), sucursal_id: SUCURSAL_ID, nombre: 'Valentina Ruiz', especialidad: 'Manicura y Pedicura', telefono: '+5491155553002', activo: true, creado_at: ahora },
    { id: pid(3), sucursal_id: SUCURSAL_ID, nombre: 'Carolina Méndez', especialidad: 'Maquillaje y Pestañas', telefono: '+5491155553003', activo: true, creado_at: ahora },
    { id: pid(4), sucursal_id: SUCURSAL_ID, nombre: 'Sofía Aguilar', especialidad: 'Cosmetología Facial', telefono: '+5491155553004', activo: true, creado_at: ahora },
  ]

  const profesionalServicios: Record<string, string[]> = {
    [pid(1)]: [sid(1), sid(2), sid(3), sid(4), sid(5), sid(6)],
    [pid(2)]: [sid(7), sid(8), sid(9), sid(10), sid(11), sid(12), sid(13), sid(14)],
    [pid(3)]: [sid(15), sid(16), sid(20), sid(21), sid(22)],
    [pid(4)]: [sid(17), sid(18), sid(19)],
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
      profesional_id: pid(1), // Eugenia — Peluquería
      servicio_id: sid(4), // Color
      fecha_hora: aLas(addDays(hoy, 1), 10),
      estado: 'CONFIRMADO',
      notas: null,
      creado_at: ahora,
    },
    {
      id: 'e0000000-0000-0000-0000-000000000002',
      cliente_id: clientes[1].id,
      profesional_id: pid(2), // Valentina — Uñas
      servicio_id: sid(10), // Semipermanente
      fecha_hora: aLas(addDays(hoy, 1), 15),
      estado: 'CONFIRMADO',
      notas: null,
      creado_at: ahora,
    },
    {
      id: 'e0000000-0000-0000-0000-000000000004',
      cliente_id: clientes[1].id,
      profesional_id: pid(4), // Sofía — Facial
      servicio_id: sid(17), // Limpieza profunda
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
    if (raw) {
      const db = JSON.parse(raw) as MockDb
      let cambio = false
      for (const profesional of db.profesionales) {
        if (!profesional.telefono && TELEFONOS_PROFESIONALES_DEMO[profesional.id]) {
          profesional.telefono = TELEFONOS_PROFESIONALES_DEMO[profesional.id]
          cambio = true
        }
      }
      const cantidadTurnos = db.turnos.length
      db.turnos = db.turnos.filter((turno) => turno.id !== 'e0000000-0000-0000-0000-000000000003')
      if (db.turnos.length !== cantidadTurnos) cambio = true
      if (cambio) guardarDb(db)
      return db
    }
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
