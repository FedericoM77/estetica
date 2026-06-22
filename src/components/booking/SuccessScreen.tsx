import { addMinutes, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import type { DatosCliente, MedioPagoReserva, Profesional, Servicio, Slot } from '../../types'

interface SuccessScreenProps {
  servicio: Servicio
  profesional: Profesional
  slot: Slot
  cliente: DatosCliente
  medioPago: MedioPagoReserva | null
  onNuevaReserva: () => void
}

function labelMedioPago(medioPago: MedioPagoReserva): string {
  if (medioPago === 'LOCAL') return 'Pago en sucursal'
  if (medioPago === 'TRANSFERENCIA') return 'Sena por transferencia'
  return 'Mercado Pago'
}

/** Formato de fechas para URL de Google Calendar: yyyyMMdd'T'HHmmss (hora local). */
function formatoGoogleCalendar(fecha: Date): string {
  return format(fecha, "yyyyMMdd'T'HHmmss")
}

export function SuccessScreen({
  servicio,
  profesional,
  slot,
  cliente,
  medioPago,
  onNuevaReserva,
}: SuccessScreenProps) {
  const inicio = new Date(slot.fechaHora)
  const fin = addMinutes(inicio, servicio.duracion_minutos)

  const calendarUrl = new URL('https://calendar.google.com/calendar/render')
  calendarUrl.searchParams.set('action', 'TEMPLATE')
  calendarUrl.searchParams.set('text', `${servicio.nombre} — AURUM`)
  calendarUrl.searchParams.set(
    'dates',
    `${formatoGoogleCalendar(inicio)}/${formatoGoogleCalendar(fin)}`,
  )
  calendarUrl.searchParams.set('details', `Turno con ${profesional.nombre} en AURUM.`)
  calendarUrl.searchParams.set('location', 'AURUM — Av. Callao 1234, CABA')

  return (
    <div className="animate-step-in mx-auto max-w-md text-center">
      <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-success/40 text-3xl text-success">
        ✓
      </span>
      <h2 className="font-display text-3xl font-light text-ink">Turno confirmado</h2>
      <p className="mt-2 text-sm text-muted">
        {cliente.nombre}, te esperamos. Vas a recibir la confirmación por WhatsApp.
      </p>

      <Card className="mt-8 text-left">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-muted">Servicio</dt>
            <dd className="font-display text-lg text-ink">{servicio.nombre}</dd>
          </div>
          <div>
            <dt className="text-muted">Profesional</dt>
            <dd className="text-ink">{profesional.nombre}</dd>
          </div>
          <div>
            <dt className="text-muted">Fecha y hora</dt>
            <dd className="capitalize text-ink">
              {format(inicio, "EEEE d 'de' MMMM 'a las' HH:mm 'hs'", { locale: es })}
            </dd>
          </div>
          {medioPago && (
            <div>
              <dt className="text-muted">Medio de pago</dt>
              <dd className="text-ink">{labelMedioPago(medioPago)}</dd>
            </div>
          )}
        </dl>
      </Card>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a href={calendarUrl.toString()} target="_blank" rel="noopener noreferrer">
          <Button variant="secondary" className="w-full sm:w-auto">
            Agregar al calendario
          </Button>
        </a>
        <Button onClick={onNuevaReserva} className="w-full sm:w-auto">
          Reservar otro turno
        </Button>
      </div>
    </div>
  )
}
