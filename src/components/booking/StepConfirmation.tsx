import { useState, type FormEvent } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useCreateTurno } from '../../hooks/useCreateTurno'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { formatPrecio } from '../../lib/format'
import type { DatosCliente, MedioPagoReserva, Profesional, Servicio, Slot } from '../../types'

interface StepConfirmationProps {
  servicio: Servicio
  profesional: Profesional
  slot: Slot
  datosIniciales?: Partial<DatosCliente>
  onSuccess: (datos: DatosCliente, medioPago: MedioPagoReserva) => void
  onBack: () => void
}

interface ErroresForm {
  nombre?: string
  telefono?: string
  email?: string
}

const mediosPago: { value: MedioPagoReserva; title: string; detail: string }[] = [
  { value: 'LOCAL', title: 'Pago en sucursal', detail: 'El paciente abona al llegar.' },
  {
    value: 'TRANSFERENCIA',
    title: 'Sena por transferencia',
    detail: 'Se coordina comprobante por WhatsApp.',
  },
  { value: 'MERCADO_PAGO', title: 'Mercado Pago', detail: 'Preparado para checkout online.' },
]

function validar(datos: DatosCliente): ErroresForm {
  const errores: ErroresForm = {}
  if (datos.nombre.trim().length < 3) errores.nombre = 'Ingresa tu nombre completo.'
  if (!/^\+?[\d\s-]{8,20}$/.test(datos.telefono.trim())) {
    errores.telefono = 'Ingresa un telefono valido (ej: +54 9 11 5555-1234).'
  }
  if (!/^\S+@\S+\.\S+$/.test(datos.email.trim())) {
    errores.email = 'Ingresa un email valido.'
  }
  return errores
}

function labelMedioPago(medioPago: MedioPagoReserva): string {
  return mediosPago.find((m) => m.value === medioPago)?.title ?? medioPago
}

export function StepConfirmation({
  servicio,
  profesional,
  slot,
  datosIniciales,
  onSuccess,
  onBack,
}: StepConfirmationProps) {
  const [datos, setDatos] = useState<DatosCliente>({
    nombre: datosIniciales?.nombre ?? '',
    telefono: datosIniciales?.telefono ?? '',
    email: datosIniciales?.email ?? '',
  })
  const [medioPago, setMedioPago] = useState<MedioPagoReserva>('LOCAL')
  const [errores, setErrores] = useState<ErroresForm>({})
  const { createTurno, isCreatingTurno, errorCreateTurno } = useCreateTurno()

  const fechaHoraLegible = format(new Date(slot.fechaHora), "EEEE d 'de' MMMM 'a las' HH:mm 'hs'", {
    locale: es,
  })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const erroresValidacion = validar(datos)
    setErrores(erroresValidacion)
    if (Object.keys(erroresValidacion).length > 0) return

    const result = await createTurno({
      cliente: datos,
      profesionalId: profesional.id,
      servicioId: servicio.id,
      fechaHora: slot.fechaHora,
      medioPago,
    })

    if (result) onSuccess(datos, medioPago)
  }

  return (
    <div className="animate-step-in">
      <h2 className="mb-6 text-center font-display text-2xl font-light text-ink">
        Confirma tu turno
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-xs uppercase tracking-wider text-muted">Resumen del turno</h3>
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
              <dd className="capitalize text-ink">{fechaHoraLegible}</dd>
            </div>
            <div>
              <dt className="text-muted">Duracion</dt>
              <dd className="text-ink">{servicio.duracion_minutos} minutos</dd>
            </div>
            <div>
              <dt className="text-muted">Precio</dt>
              <dd className="font-display text-lg text-gold">{formatPrecio(servicio)}</dd>
            </div>
            <div>
              <dt className="text-muted">Pago</dt>
              <dd className="text-ink">{labelMedioPago(medioPago)}</dd>
            </div>
          </dl>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Nombre completo"
            value={datos.nombre}
            onChange={(e) => setDatos((d) => ({ ...d, nombre: e.target.value }))}
            error={errores.nombre}
            autoComplete="name"
            required
          />
          <Input
            label="Telefono"
            type="tel"
            value={datos.telefono}
            onChange={(e) => setDatos((d) => ({ ...d, telefono: e.target.value }))}
            error={errores.telefono}
            autoComplete="tel"
            placeholder="+54 9 11 5555-1234"
            required
          />
          <Input
            label="Email"
            type="email"
            value={datos.email}
            onChange={(e) => setDatos((d) => ({ ...d, email: e.target.value }))}
            error={errores.email}
            autoComplete="email"
            required
          />

          <fieldset className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <legend className="px-1 text-sm text-slate-500 dark:text-slate-400">
              Medio de pago
            </legend>
            <div className="mt-3 grid gap-2">
              {mediosPago.map((medio) => (
                <label
                  key={medio.value}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-700 transition hover:border-sky-300 dark:border-slate-700 dark:text-slate-200 dark:hover:border-sky-400"
                >
                  <input
                    type="radio"
                    name="medioPago"
                    value={medio.value}
                    checked={medioPago === medio.value}
                    onChange={() => setMedioPago(medio.value)}
                    className="mt-1 h-4 w-4 accent-sky-500"
                  />
                  <span>
                    <span className="block font-medium">{medio.title}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      {medio.detail}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {errorCreateTurno && <p className="text-sm text-error">{errorCreateTurno}</p>}

          <div className="flex justify-between pt-2">
            <Button type="button" variant="secondary" onClick={onBack}>
              Volver
            </Button>
            <Button type="submit" disabled={isCreatingTurno}>
              {isCreatingTurno ? 'Confirmando...' : 'Confirmar turno'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
