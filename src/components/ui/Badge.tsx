import type { EstadoTurno } from '../../types'

const estadoStyles: Record<EstadoTurno, string> = {
  CONFIRMADO: 'border-gold/40 text-gold',
  CANCELADO: 'border-error/40 text-error',
  COMPLETADO: 'border-success/40 text-success',
}

export function Badge({ estado }: { estado: EstadoTurno }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide ${estadoStyles[estado]}`}
    >
      {estado}
    </span>
  )
}
