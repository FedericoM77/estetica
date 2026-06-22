import { Link } from 'react-router-dom'
import { usingMocks } from '../../lib/api'

export function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-6">
        <Link to="/" className="flex flex-col items-center">
          <h1 className="font-display text-3xl font-light tracking-[0.35em] text-ink sm:text-4xl">
            AURUM
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-muted">
            Centro de Estetica Avanzada
          </p>
        </Link>

        <p className="mt-4 text-center text-sm text-muted">
          Reserva libre online: elegi especialidad, profesional, horario y confirma tu turno.
        </p>

        {usingMocks && (
          <span
            className="mt-3 rounded-full border border-gold/40 px-3 py-0.5 text-[10px] uppercase tracking-[0.2em] text-gold"
            title="Datos de demostracion en este navegador, sin base de datos real"
          >
            Demo
          </span>
        )}
      </div>
    </header>
  )
}
