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
    <div className="flex min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 transition-colors md:flex dark:border-purple-950/40 dark:bg-zinc-950">
        <div className="px-2">
          <span className="font-display text-2xl font-light tracking-[0.3em] text-slate-950 dark:text-zinc-50">
            AURUM
          </span>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-500">
            Administracion
          </p>
          {usingMocks && (
            <span className="mt-2 inline-block rounded-full border border-sky-500/30 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-sky-600 dark:border-amber-400/25 dark:text-amber-300">
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
                  isActive
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20 dark:border-l-2 dark:border-amber-300 dark:bg-zinc-900 dark:text-[#E6C687] dark:shadow-none'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-zinc-500 dark:hover:bg-zinc-900/70 dark:hover:text-zinc-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-slate-200 pt-4 dark:border-zinc-800">
          <p className="px-3 text-xs text-slate-500 dark:text-zinc-500">
            {usuario?.nombre || usuario?.email}
          </p>
          <button
            onClick={() => void salir()}
            className="mt-1 px-3 text-sm text-slate-500 transition-colors hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400"
          >
            Salir
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden dark:border-zinc-800 dark:bg-zinc-950">
          <span className="font-display text-xl font-light tracking-[0.3em] text-slate-950 dark:text-zinc-50">
            AURUM
          </span>
          <button
            onClick={() => void salir()}
            className="text-sm text-slate-500 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400"
          >
            Salir
          </button>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-2 py-2 md:hidden dark:border-zinc-800 dark:bg-zinc-950">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-btn px-3 py-1.5 text-xs transition-colors ${
                  isActive
                    ? 'bg-sky-500 text-white dark:bg-zinc-900 dark:text-[#E6C687]'
                    : 'text-slate-500 hover:text-slate-950 dark:text-zinc-500 dark:hover:text-zinc-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-8 pt-20 lg:pl-4 lg:pr-52 md:pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
