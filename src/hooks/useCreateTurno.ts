import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { api, SlotOcupadoError, type CrearTurnoInput, type CrearTurnoResult } from '../lib/api'
import { enviarConfirmacionTurno } from '../lib/whatsapp'

/**
 * Crea un turno CONFIRMADO (upsert de cliente por teléfono + insert).
 * La defensa real contra doble reserva vive en la capa de datos
 * (constraint unique_profesional_agenda en DB / chequeo en mock).
 */
export function useCreateTurno() {
  const [isCreatingTurno, setIsCreatingTurno] = useState(false)
  const [errorCreateTurno, setErrorCreateTurno] = useState<string | null>(null)

  async function createTurno(input: CrearTurnoInput): Promise<CrearTurnoResult | null> {
    setIsCreatingTurno(true)
    setErrorCreateTurno(null)

    try {
      const result = await api.crearTurno(input)
      const fechaHoraLegible = format(
        new Date(result.turno.fecha_hora),
        "EEEE d 'de' MMMM 'a las' HH:mm 'hs'",
        { locale: es },
      )
      const medioPago = input.medioPago?.replace('_', ' ')

      void Promise.allSettled([
        enviarConfirmacionTurno({
          telefono: result.cliente.telefono,
          nombreCliente: result.cliente.nombre,
          servicio: result.servicio.nombre,
          profesional: result.profesional.nombre,
          fechaHoraLegible,
          medioPago,
          destinatario: 'cliente',
        }),
        result.profesional.telefono
          ? enviarConfirmacionTurno({
              telefono: result.profesional.telefono,
              nombreCliente: result.cliente.nombre,
              servicio: result.servicio.nombre,
              profesional: result.profesional.nombre,
              fechaHoraLegible,
              medioPago,
              destinatario: 'profesional',
            })
          : Promise.resolve(),
      ])

      return result
    } catch (error) {
      if (error instanceof SlotOcupadoError) {
        setErrorCreateTurno(
          'Ese horario acaba de ser reservado por otra persona. Elegí otro horario.',
        )
      } else {
        console.error('[useCreateTurno]', error)
        setErrorCreateTurno('No se pudo confirmar el turno. Intentá de nuevo.')
      }
      return null
    } finally {
      setIsCreatingTurno(false)
    }
  }

  return { createTurno, isCreatingTurno, errorCreateTurno }
}
