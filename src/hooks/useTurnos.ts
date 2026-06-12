import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { EstadoTurno, TurnoDetalle } from '../types'

interface FiltrosTurnos {
  /** Inicio del rango (inclusive), ISO string */
  desde: string
  /** Fin del rango (exclusive), ISO string */
  hasta: string
  profesionalId: string | null
  estado: EstadoTurno | null
}

/** Turnos con relaciones embebidas para la agenda del admin. */
export function useTurnos(filtros: FiltrosTurnos) {
  const [turnos, setTurnos] = useState<TurnoDetalle[]>([])
  const [isLoadingTurnos, setIsLoadingTurnos] = useState(true)
  const [errorTurnos, setErrorTurnos] = useState<string | null>(null)
  // Incrementar fuerza un refetch con los mismos filtros
  const [version, setVersion] = useState(0)

  const { desde, hasta, profesionalId, estado } = filtros

  useEffect(() => {
    let cancelled = false

    async function fetchTurnos() {
      let query = supabase
        .from('turnos')
        .select('*, cliente:clientes(*), profesional:profesionales(*), servicio:servicios(*)')
        .gte('fecha_hora', desde)
        .lt('fecha_hora', hasta)
        .order('fecha_hora')

      if (profesionalId) query = query.eq('profesional_id', profesionalId)
      if (estado) query = query.eq('estado', estado)

      const { data, error } = await query

      if (cancelled) return

      if (error) {
        setErrorTurnos('No se pudieron cargar los turnos. Intentá de nuevo.')
        console.error('[useTurnos]', error)
      } else {
        setErrorTurnos(null)
        setTurnos((data ?? []) as unknown as TurnoDetalle[])
      }
      setIsLoadingTurnos(false)
    }

    void fetchTurnos()
    return () => {
      cancelled = true
    }
  }, [desde, hasta, profesionalId, estado, version])

  const refetchTurnos = useCallback(() => {
    setIsLoadingTurnos(true)
    setVersion((v) => v + 1)
  }, [])

  async function updateEstado(turnoId: string, nuevoEstado: EstadoTurno): Promise<boolean> {
    const { error } = await supabase
      .from('turnos')
      .update({ estado: nuevoEstado })
      .eq('id', turnoId)

    if (error) {
      console.error('[useTurnos.updateEstado]', error)
      setErrorTurnos('No se pudo actualizar el estado del turno.')
      return false
    }
    refetchTurnos()
    return true
  }

  return { turnos, isLoadingTurnos, errorTurnos, refetchTurnos, updateEstado }
}
