import { useState, type FormEvent } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useCreateTurno } from '../../hooks/useCreateTurno'
import { enviarConfirmacionTurno } from '../../lib/whatsapp'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { formatPrecio } from '../../lib/format'
import type { DatosCliente, Profesional, Servicio, Slot } from '../../types'

interface StepConfirmationProps {
  servicio: Servicio
  profesional: Profesional
  slot: Slot
  /** Prefill con los datos del paciente autenticado. */
  datosIniciales?: Partial<DatosCliente>
  onSuccess: (datos: DatosCliente) => void
  onBack: () => void
}

interface ErroresForm {
  nombre?: string
  telefono?: string
  email?: string
}

function validar(datos: DatosCliente): ErroresForm {
  const errores: ErroresForm = {}
  if (datos.nombre.trim().length < 3) {
    errores.nombre = 'Ingresá tu nombre completo.'
  }
  if (!/^\+?[\d\s-]{8,20}$/.test(datos.telefono.trim())) {
    errores.telefono = 'Ingresá un teléfono válido (ej: +54 9 11 5555-1234).'
  }
  if (!/^\S+@\S+\.\S+$/.test(datos.email.trim())) {
    errores.email = 'Ingresá un email válido.'
  }
  return errores
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
    })

    if (result) {
      // Notificación desacoplada: nunca bloquea la confirmación
      void enviarConfirmacionTurno({
        telefono: datos.telefono,
        nombreCliente: datos.nombre,
        servicio: servicio.nombre,
        profesional: profesional.nombre,
        fechaHoraLegible,
      })
      onSuccess(datos)
    }
  }

  return (
    <div className="animate-step-in">
      <h2 className="mb-6 text-center font-display text-2xl font-light text-ink">
        Confirmá tu turno
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Resumen */}
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
              <dt className="text-muted">Duración</dt>
              <dd className="text-ink">{servicio.duracion_minutos} minutos</dd>
            </div>
            <div>
              <dt className="text-muted">Precio</dt>
              <dd className="font-display text-lg text-gold">{formatPrecio(servicio)}</dd>
            </div>
          </dl>
        </Card>

        {/* Datos del paciente */}
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
            label="Teléfono"
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

          {errorCreateTurno && <p className="text-sm text-error">{errorCreateTurno}</p>}

          <div className="flex justify-between pt-2">
            <Button type="button" variant="secondary" onClick={onBack}>
              Volver
            </Button>
            <Button type="submit" disabled={isCreatingTurno}>
              {isCreatingTurno ? 'Confirmando…' : 'Confirmar turno'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
