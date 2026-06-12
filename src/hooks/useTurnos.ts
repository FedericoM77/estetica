import { useCallback, useEffect, useState } from 'react'
import { api, type FiltrosTurnos } from '../lib/api'
import type { EstadoTurno, TurnoDetalle } from '../types'

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
      try {
        const data = await api.getTurnosDetalle({ desde, hasta, profesionalId, estado })
        if (cancelled) return
        setTurnos(data)
        setErrorTurnos(null)
      } catch (error) {
        if (cancelled) return
        console.error('[useTurnos]', error)
        setErrorTurnos('No se pudieron cargar los turnos. Intentá de nuevo.')
      } finally {
        if (!cancelled) setIsLoadingTurnos(false)
      }
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
    try {
      await api.updateEstadoTurno(turnoId, nuevoEstado)
      refetchTurnos()
      return true
    } catch (error) {
      console.error('[useTurnos.updateEstado]', error)
      setErrorTurnos('No se pudo actualizar el estado del turno.')
      return false
    }
  }

  return { turnos, isLoadingTurnos, errorTurnos, refetchTurnos, updateEstado }
}
