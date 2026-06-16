import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Rol } from '../../types'
import { useAuth } from '../../hooks/useAuth'
import { Spinner } from '../ui/Spinner'

/**
 * Protege un grupo de rutas por rol. Redirige al login correspondiente si no
 * hay sesión, y a su área propia si el rol no coincide (un admin no entra al
 * flujo de paciente y viceversa).
 */
export function ProtectedRoute({ rol }: { rol: Rol }) {
  const { usuario, isLoadingAuth } = useAuth()
  const location = useLocation()

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <Spinner label="Cargando…" />
      </div>
    )
  }

  if (!usuario) {
    const loginPath = rol === 'ADMIN' ? '/admin/login' : '/ingresar'
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />
  }

  if (usuario.rol !== rol) {
    // Sesión válida pero del otro rol: lo mandamos a su área.
    const destino = usuario.rol === 'ADMIN' ? '/admin' : '/'
    return <Navigate to={destino} replace />
  }

  return <Outlet />
}
