import type { EstadoTurno } from '../../types'

const estadoStyles: Record<EstadoTurno, string> = {
  CONFIRMADO:
    'border-gold/40 text-gold dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400',
  CANCELADO:
    'border-error/40 text-error dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400',
  COMPLETADO:
    'border-success/40 text-success dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
}

const estadoLabels: Record<EstadoTurno, string> = {
  CONFIRMADO: 'CONFIRMED',
  CANCELADO: 'CANCELLED',
  COMPLETADO: 'COMPLETED',
}

export function Badge({ estado }: { estado: EstadoTurno }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide ${estadoStyles[estado]}`}
    >
      {estadoLabels[estado]}
    </span>
  )
}
