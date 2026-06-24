import type { ReactNode } from 'react'
import { usingMocks } from '../../lib/api'

interface AuthLayoutProps {
  titulo: string
  subtitulo?: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ titulo, subtitulo, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="mb-8 flex flex-col items-center">
        <h1 className="font-display text-4xl font-light tracking-[0.35em] text-slate-950 dark:text-white">
          GlowDesk
        </h1>
        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
          Gestion de esteticas y bienestar
        </p>
      </div>

      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.55)] sm:p-8 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <h2 className="font-display text-2xl font-light text-slate-950 dark:text-white">{titulo}</h2>
        {subtitulo && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitulo}</p>}
        <div className="mt-6">{children}</div>
      </div>

      {footer && (
        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">{footer}</div>
      )}

      {usingMocks && (
        <p className="mt-6 max-w-sm text-center text-xs text-slate-400 dark:text-slate-500">
          Modo demo: admin@demo.com / 1234 - cliente@demo.com / 1234
        </p>
      )}
    </div>
  )
}
