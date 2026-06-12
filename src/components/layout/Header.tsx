import { usingMocks } from '../../lib/api'

export function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-6">
        <h1 className="font-display text-3xl font-light tracking-[0.35em] text-ink sm:text-4xl">
          AURUM
        </h1>
        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-muted">
          Centro de Estética Avanzada
        </p>
        {usingMocks && (
          <span
            className="mt-3 rounded-full border border-gold/40 px-3 py-0.5 text-[10px] uppercase tracking-[0.2em] text-gold"
            title="Datos de demostración en este navegador — sin base de datos real"
          >
            Demo
          </span>
        )}
      </div>
    </header>
  )
}
