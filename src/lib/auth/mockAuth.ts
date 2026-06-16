// Auth del modo demo: usuarios en mockDb (localStorage), sin backend.
// Usuarios sembrados: admin@demo / 1234  y  cliente@demo / 1234.
// Sin tokens ni hashing — SOLO demo.

import type { Usuario } from '../../types'
import { delay, guardarDb, leerDb, nuevoId, type MockUsuario } from '../api/mockDb'
import { AuthError, type AuthApi, type CredencialesLogin, type DatosRegistro } from './types'

const SESION_KEY = 'aurum-demo-sesion-v1'

type Listener = (usuario: Usuario | null) => void
const listeners = new Set<Listener>()

function aUsuario(u: MockUsuario): Usuario {
  return { id: u.id, email: u.email, rol: u.rol, nombre: u.nombre, clienteId: u.clienteId }
}

function guardarSesion(userId: string | null): void {
  try {
    if (userId) localStorage.setItem(SESION_KEY, userId)
    else localStorage.removeItem(SESION_KEY)
  } catch {
    // sin storage: la sesión no persiste entre recargas, aceptable en demo
  }
}

function leerSesionId(): string | null {
  try {
    return localStorage.getItem(SESION_KEY)
  } catch {
    return null
  }
}

function notificar(usuario: Usuario | null): void {
  for (const cb of listeners) cb(usuario)
}

export const mockAuth: AuthApi = {
  async getUsuarioActual(): Promise<Usuario | null> {
    const id = leerSesionId()
    if (!id) return null
    const u = leerDb().usuarios.find((x) => x.id === id)
    return u ? aUsuario(u) : null
  },

  async iniciarSesion({ email, password }: CredencialesLogin): Promise<Usuario> {
    await delay()
    const correo = email.trim().toLowerCase()
    const u = leerDb().usuarios.find((x) => x.email.toLowerCase() === correo)
    if (!u || u.password !== password) {
      throw new AuthError('Email o contraseña incorrectos.')
    }
    guardarSesion(u.id)
    const usuario = aUsuario(u)
    notificar(usuario)
    return usuario
  },

  async registrarPaciente(datos: DatosRegistro): Promise<Usuario> {
    await delay()
    const db = leerDb()
    const correo = datos.email.trim().toLowerCase()
    if (db.usuarios.some((x) => x.email.toLowerCase() === correo)) {
      throw new AuthError('Ya existe una cuenta con ese email.')
    }

    const cliente = {
      id: nuevoId(),
      nombre: datos.nombre.trim(),
      telefono: datos.telefono.trim(),
      email: datos.email.trim(),
      creado_at: new Date().toISOString(),
    }
    db.clientes.push(cliente)

    const usuarioMock: MockUsuario = {
      id: nuevoId(),
      email: datos.email.trim(),
      password: datos.password,
      rol: 'CLIENTE',
      nombre: datos.nombre.trim(),
      clienteId: cliente.id,
    }
    db.usuarios.push(usuarioMock)
    guardarDb(db)

    guardarSesion(usuarioMock.id)
    const usuario = aUsuario(usuarioMock)
    notificar(usuario)
    return usuario
  },

  async cerrarSesion(): Promise<void> {
    guardarSesion(null)
    notificar(null)
  },

  onCambioSesion(cb: Listener): () => void {
    listeners.add(cb)
    return () => listeners.delete(cb)
  },
}
