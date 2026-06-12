import { useState } from 'react'
import { api, SlotOcupadoError, type CrearTurnoInput, type CrearTurnoResult } from '../lib/api'

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
      return await api.crearTurno(input)
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
