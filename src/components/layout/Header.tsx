import { Link } from 'react-router-dom'
import { usingMocks } from '../../lib/api'

export function Header() {
  return (
    <header className="relative border-b border-amber-100/50 bg-[#f5f5f3]/55 backdrop-blur-sm dark:border-white/10 dark:bg-black/10">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-8">
        <Link to="/" className="flex flex-col items-center">
          <h1 className="font-display text-4xl font-medium uppercase leading-none tracking-widest text-zinc-800 sm:text-5xl dark:text-[#E6C687]">
            GlowDesk
          </h1>
          <p className="mt-2 text-xs uppercase tracking-[0.32em] text-amber-800/70 dark:text-amber-100/70">
            Reservas de estetica y bienestar
          </p>
        </Link>

        <p className="mt-5 max-w-xl text-center text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Reserva libre online: elegi especialidad, profesional, horario y confirma tu turno.
        </p>

        {usingMocks && (
          <span
            className="mt-4 rounded-full border border-amber-200/70 bg-white/45 px-3 py-0.5 text-[10px] uppercase tracking-[0.2em] text-amber-700 backdrop-blur dark:border-amber-300/25 dark:bg-white/5 dark:text-amber-200"
            title="Datos de demostracion en este navegador, sin base de datos real"
          >
            Demo
          </span>
        )}
      </div>
    </header>
  )
}
