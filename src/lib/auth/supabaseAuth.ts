// Auth real con Supabase Auth. El rol y el cliente_id se resuelven desde
// la tabla `perfiles` (ver migración 20260616000000_auth_roles.sql).
// Requiere el proyecto Supabase con "Confirm email" DESACTIVADO para que
// el registro de paciente deje sesión iniciada de inmediato.

import type { SupabaseClient, User } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import type { Rol, Usuario } from '../../types'
import { AuthError, type AuthApi, type CredencialesLogin, type DatosRegistro } from './types'

function client(): SupabaseClient {
  if (!supabase) {
    throw new Error('Cliente Supabase no inicializado: faltan credenciales en .env')
  }
  return supabase
}

/** Combina el usuario de auth con su fila en `perfiles`. */
async function resolverUsuario(authUser: User): Promise<Usuario> {
  const { data, error } = await client()
    .from('perfiles')
    .select('rol, nombre, cliente_id')
    .eq('id', authUser.id)
    .single()
  if (error) throw error

  const perfil = data as { rol: Rol; nombre: string; cliente_id: string | null }
  return {
    id: authUser.id,
    email: authUser.email ?? '',
    rol: perfil.rol,
    nombre: perfil.nombre,
    clienteId: perfil.cliente_id,
  }
}

function traducirError(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'Email o contraseña incorrectos.'
  if (/already registered|already been registered/i.test(message)) {
    return 'Ya existe una cuenta con ese email.'
  }
  if (/password should be at least/i.test(message)) {
    return 'La contraseña es demasiado corta (mínimo 6 caracteres).'
  }
  return message
}

export const supabaseAuth: AuthApi = {
  async getUsuarioActual(): Promise<Usuario | null> {
    const { data } = await client().auth.getUser()
    if (!data.user) return null
    return resolverUsuario(data.user)
  },

  async iniciarSesion({ email, password }: CredencialesLogin): Promise<Usuario> {
    const { data, error } = await client().auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) throw new AuthError(traducirError(error.message))
    if (!data.user) throw new AuthError('No se pudo iniciar sesión.')
    return resolverUsuario(data.user)
  },

  async registrarPaciente(datos: DatosRegistro): Promise<Usuario> {
    const { data, error } = await client().auth.signUp({
      email: datos.email.trim(),
      password: datos.password,
      options: {
        data: {
          nombre: datos.nombre.trim(),
          telefono: datos.telefono.trim(),
          rol: 'CLIENTE',
        },
      },
    })
    if (error) throw new AuthError(traducirError(error.message))

    // Con "Confirm email" activado, signUp no deja sesión; iniciamos sesión
    // explícita para devolver el usuario resuelto.
    let user = data.user
    if (!data.session) {
      const { data: login, error: errorLogin } = await client().auth.signInWithPassword({
        email: datos.email.trim(),
        password: datos.password,
      })
      if (errorLogin) throw new AuthError(traducirError(errorLogin.message))
      user = login.user
    }
    if (!user) throw new AuthError('No se pudo completar el registro.')
    return resolverUsuario(user)
  },

  async cerrarSesion(): Promise<void> {
    const { error } = await client().auth.signOut()
    if (error) throw error
  },

  onCambioSesion(cb: (usuario: Usuario | null) => void): () => void {
    const { data } = client().auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        cb(null)
        return
      }
      resolverUsuario(session.user)
        .then(cb)
        .catch(() => cb(null))
    })
    return () => data.subscription.unsubscribe()
  },
}
