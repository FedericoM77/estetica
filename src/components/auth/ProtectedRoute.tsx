import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Rol } from '../../types'
import { useAuth } from '../../hooks/useAuth'
import { Spinner } from '../ui/Spinner'

function esRolAdmin(rol: Rol): boolean {
  return rol === 'ADMIN' || rol === 'SUPER_ADMIN'
}

export function ProtectedRoute({ rol }: { rol: Rol }) {
  const { usuario, isLoadingAuth } = useAuth()
  const location = useLocation()

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <Spinner label="Cargando..." />
      </div>
    )
  }

  if (!usuario) {
    const loginPath = rol === 'ADMIN' || rol === 'SUPER_ADMIN' ? '/admin/login' : '/ingresar'
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />
  }

  if (rol === 'ADMIN' && esRolAdmin(usuario.rol)) {
    return <Outlet />
  }

  if (usuario.rol !== rol) {
    const destino = esRolAdmin(usuario.rol) ? '/admin' : '/'
    return <Navigate to={destino} replace />
  }

  return <Outlet />
}
