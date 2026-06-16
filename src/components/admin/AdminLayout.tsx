import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { usingMocks } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/turnos', label: 'Turnos', end: false },
  { to: '/admin/esteticistas', label: 'Esteticistas', end: false },
  { to: '/admin/tratamientos', label: 'Tratamientos', end: false },
  { to: '/admin/sucursales', label: 'Sucursales', end: false },
]

export function AdminLayout() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  async function salir() {
    await cerrarSesion()
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-base">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-surface px-4 py-6 md:flex">
        <div className="px-2">
          <span className="font-display text-2xl font-light tracking-[0.3em] text-ink">AURUM</span>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted">Administración</p>
          {usingMocks && (
            <span className="mt-2 inline-block rounded-full border border-gold/40 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-gold">
              Demo
            </span>
          )}
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-btn px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-gold/10 text-gold' : 'text-muted hover:bg-line/30 hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-line pt-4">
          <p className="px-3 text-xs text-muted">{usuario?.nombre || usuario?.email}</p>
          <button
            onClick={() => void salir()}
            className="mt-1 px-3 text-sm text-muted transition-colors hover:text-error"
          >
            Salir
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex flex-1 flex-col">
        {/* Barra superior móvil */}
        <header className="flex items-center justify-between border-b border-line px-4 py-3 md:hidden">
          <span className="font-display text-xl font-light tracking-[0.3em] text-ink">AURUM</span>
          <button onClick={() => void salir()} className="text-sm text-muted hover:text-error">
            Salir
          </button>
        </header>

        {/* Nav horizontal en móvil */}
        <nav className="flex gap-1 overflow-x-auto border-b border-line px-2 py-2 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-btn px-3 py-1.5 text-xs transition-colors ${
                  isActive ? 'bg-gold/10 text-gold' : 'text-muted hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
