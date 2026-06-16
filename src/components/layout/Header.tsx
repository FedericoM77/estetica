import { Link, NavLink, useNavigate } from 'react-router-dom'
import { usingMocks } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'

export function Header() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  async function salir() {
    await cerrarSesion()
    navigate('/ingresar')
  }

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-6">
        <Link to="/" className="flex flex-col items-center">
          <h1 className="font-display text-3xl font-light tracking-[0.35em] text-ink sm:text-4xl">
            AURUM
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-muted">
            Centro de Estética Avanzada
          </p>
        </Link>

        {usingMocks && (
          <span
            className="mt-3 rounded-full border border-gold/40 px-3 py-0.5 text-[10px] uppercase tracking-[0.2em] text-gold"
            title="Datos de demostración en este navegador — sin base de datos real"
          >
            Demo
          </span>
        )}

        {usuario && usuario.rol === 'CLIENTE' && (
          <nav className="mt-4 flex items-center gap-5 text-sm">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? 'text-gold' : 'text-muted transition-colors hover:text-ink'
              }
            >
              Reservar
            </NavLink>
            <NavLink
              to="/mis-turnos"
              className={({ isActive }) =>
                isActive ? 'text-gold' : 'text-muted transition-colors hover:text-ink'
              }
            >
              Mis turnos
            </NavLink>
            <span className="text-line">·</span>
            <span className="text-muted">{usuario.nombre || usuario.email}</span>
            <button onClick={() => void salir()} className="text-muted transition-colors hover:text-error">
              Salir
            </button>
          </nav>
        )}
      </div>
    </header>
  )
}
