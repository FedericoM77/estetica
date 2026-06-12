import { useEffect, useState } from 'react'
import { addMinutes, endOfDay, format, isBefore, set, startOfDay } from 'date-fns'
import { api } from '../lib/api'
import type { Slot } from '../types'

const HORA_APERTURA = 9
const HORA_CIERRE = 19

/**
 * Slots disponibles para un profesional en un día, en bloques de la
 * duración del servicio seleccionado. Horario de atención 9:00–19:00.
 * Un slot queda deshabilitado si se solapa con un turno existente
 * (no cancelado) o si ya pasó.
 */
export function useAvailability(
  profesionalId: string | null,
  fecha: Date | null,
  duracionMinutos: number | null,
) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false)
  const [errorAvailability, setErrorAvailability] = useState<string | null>(null)

  const tieneParametros = Boolean(profesionalId && fecha && duracionMinutos)

  useEffect(() => {
    if (!profesionalId || !fecha || !duracionMinutos) return

    let cancelled = false

    async function fetchAvailability() {
      setIsLoadingAvailability(true)
      setErrorAvailability(null)
      const dia = fecha as Date

      try {
        const ocupadosRaw = await api.getTurnosOcupados(
          profesionalId as string,
          startOfDay(dia).toISOString(),
          endOfDay(dia).toISOString(),
        )
        if (cancelled) return

        const ocupados = ocupadosRaw.map((t) => {
          const inicio = new Date(t.fechaHora)
          return { inicio, fin: addMinutes(inicio, t.duracionMinutos) }
        })

        const ahora = new Date()
        const apertura = set(dia, {
          hours: HORA_APERTURA,
          minutes: 0,
          seconds: 0,
          milliseconds: 0,
        })
        const cierre = set(dia, { hours: HORA_CIERRE, minutes: 0, seconds: 0, milliseconds: 0 })

        const generados: Slot[] = []
        let inicioSlot = apertura
        while (!isBefore(cierre, addMinutes(inicioSlot, duracionMinutos as number))) {
          const finSlot = addMinutes(inicioSlot, duracionMinutos as number)
          const solapado = ocupados.some(
            (o) => isBefore(inicioSlot, o.fin) && isBefore(o.inicio, finSlot),
          )
          const pasado = isBefore(inicioSlot, ahora)
          generados.push({
            fechaHora: inicioSlot.toISOString(),
            label: format(inicioSlot, 'HH:mm'),
            disponible: !solapado && !pasado,
          })
          inicioSlot = finSlot
        }

        setSlots(generados)
      } catch (error) {
        if (cancelled) return
        console.error('[useAvailability]', error)
        setErrorAvailability('No se pudo consultar la disponibilidad. Intentá de nuevo.')
      } finally {
        if (!cancelled) setIsLoadingAvailability(false)
      }
    }

    void fetchAvailability()
    return () => {
      cancelled = true
    }
  }, [profesionalId, fecha, duracionMinutos])

  // Sin parámetros completos no hay disponibilidad que mostrar;
  // se deriva en lugar de limpiar estado dentro del efecto.
  return {
    slots: tieneParametros ? slots : [],
    isLoadingAvailability,
    errorAvailability,
  }
}
