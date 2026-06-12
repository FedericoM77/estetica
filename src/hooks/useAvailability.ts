import { useEffect, useState } from 'react'
import { addMinutes, format, isBefore, set, startOfDay, endOfDay } from 'date-fns'
import { supabase } from '../lib/supabase'
import type { Slot } from '../types'

const HORA_APERTURA = 9
const HORA_CIERRE = 19

interface TurnoOcupado {
  fecha_hora: string
  servicios: { duracion_minutos: number } | null
}

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
      const { data, error } = await supabase
        .from('turnos')
        .select('fecha_hora, servicios(duracion_minutos)')
        .eq('profesional_id', profesionalId as string)
        .neq('estado', 'CANCELADO')
        .gte('fecha_hora', startOfDay(dia).toISOString())
        .lte('fecha_hora', endOfDay(dia).toISOString())

      if (cancelled) return

      if (error) {
        setErrorAvailability('No se pudo consultar la disponibilidad. Intentá de nuevo.')
        console.error('[useAvailability]', error)
        setIsLoadingAvailability(false)
        return
      }

      const ocupados = ((data ?? []) as unknown as TurnoOcupado[]).map((t) => {
        const inicio = new Date(t.fecha_hora)
        const duracion = t.servicios?.duracion_minutos ?? 60
        return { inicio, fin: addMinutes(inicio, duracion) }
      })

      const ahora = new Date()
      const apertura = set(dia, { hours: HORA_APERTURA, minutes: 0, seconds: 0, milliseconds: 0 })
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
      setIsLoadingAvailability(false)
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
