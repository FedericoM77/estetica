import type { ReactNode } from 'react'
import { usingMocks } from '../../lib/api'

interface AuthLayoutProps {
  titulo: string
  subtitulo?: string
  children: ReactNode
  footer?: ReactNode
}

/** Card centrada con la marca AURUM para las pantallas de login/registro. */
export function AuthLayout({ titulo, subtitulo, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-4 py-10">
      <div className="mb-8 flex flex-col items-center">
        <h1 className="font-display text-4xl font-light tracking-[0.35em] text-ink">AURUM</h1>
        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-muted">
          Centro de Estética Avanzada
        </p>
      </div>

      <div className="w-full max-w-sm rounded-card border border-line bg-surface p-6 shadow-soft sm:p-8">
        <h2 className="font-display text-2xl font-light text-ink">{titulo}</h2>
        {subtitulo && <p className="mt-1 text-sm text-muted">{subtitulo}</p>}
        <div className="mt-6">{children}</div>
      </div>

      {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}

      {usingMocks && (
        <p className="mt-6 max-w-sm text-center text-xs text-line">
          Modo demo · admin@demo.com / 1234 · cliente@demo.com / 1234
        </p>
      )}
    </div>
  )
}
