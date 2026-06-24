import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Usuario } from '../../types'
import { auth } from './index'
import type { CredencialesLogin, DatosRegistro } from './types'

interface AuthContextValue {
  usuario: Usuario | null
  /** True mientras se resuelve la sesión inicial. */
  isLoadingAuth: boolean
  esAdmin: boolean
  iniciarSesion: (cred: CredencialesLogin) => Promise<Usuario>
  registrarPaciente: (datos: DatosRegistro) => Promise<Usuario>
  cerrarSesion: () => Promise<void>
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  useEffect(() => {
    let activo = true

    auth
      .getUsuarioActual()
      .then((u) => {
        if (activo) setUsuario(u)
      })
      .catch(() => {
        if (activo) setUsuario(null)
      })
      .finally(() => {
        if (activo) setIsLoadingAuth(false)
      })

    const desuscribir = auth.onCambioSesion((u) => {
      if (activo) setUsuario(u)
    })

    return () => {
      activo = false
      desuscribir()
    }
  }, [])

  const iniciarSesion = useCallback(async (cred: CredencialesLogin) => {
    const u = await auth.iniciarSesion(cred)
    setUsuario(u)
    return u
  }, [])

  const registrarPaciente = useCallback(async (datos: DatosRegistro) => {
    const u = await auth.registrarPaciente(datos)
    setUsuario(u)
    return u
  }, [])

  const cerrarSesion = useCallback(async () => {
    await auth.cerrarSesion()
    setUsuario(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      isLoadingAuth,
      esAdmin: usuario?.rol === 'ADMIN' || usuario?.rol === 'SUPER_ADMIN',
      iniciarSesion,
      registrarPaciente,
      cerrarSesion,
    }),
    [usuario, isLoadingAuth, iniciarSesion, registrarPaciente, cerrarSesion],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
