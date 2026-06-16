import type { Usuario } from '../../types'

export interface CredencialesLogin {
  email: string
  password: string
}

export interface DatosRegistro {
  nombre: string
  telefono: string
  email: string
  password: string
}

/** Error de autenticación con mensaje apto para mostrar al usuario. */
export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * Contrato de autenticación. Dos implementaciones:
 * supabaseAuth (real, Supabase Auth) y mockAuth (demo en localStorage).
 */
export interface AuthApi {
  /** Usuario de la sesión activa, ya resuelto con su rol. Null si no hay sesión. */
  getUsuarioActual(): Promise<Usuario | null>
  iniciarSesion(cred: CredencialesLogin): Promise<Usuario>
  /** Registra un paciente (rol CLIENTE) y deja la sesión iniciada. */
  registrarPaciente(datos: DatosRegistro): Promise<Usuario>
  cerrarSesion(): Promise<void>
  /** Suscribe a cambios de sesión. Devuelve la función para desuscribirse. */
  onCambioSesion(cb: (usuario: Usuario | null) => void): () => void
}
