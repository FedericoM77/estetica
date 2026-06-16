import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { EstadoTurno, TurnoDetalle } from '../types'

/** Turnos del paciente autenticado (por su cliente_id). */
export function useMisTurnos(clienteId: string | null) {
  const [turnos, setTurnos] = useState<TurnoDetalle[]>([])
  // Sin clienteId no hay nada que cargar; arrancamos en "no cargando".
  const [isLoadingMisTurnos, setIsLoadingMisTurnos] = useState(() => Boolean(clienteId))
  const [errorMisTurnos, setErrorMisTurnos] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!clienteId) return
    let cancelled = false
    async function fetch() {
      setIsLoadingMisTurnos(true)
      try {
        const data = await api.getTurnosDeCliente(clienteId as string)
        if (cancelled) return
        setTurnos(data)
        setErrorMisTurnos(null)
      } catch (error) {
        if (cancelled) return
        console.error('[useMisTurnos]', error)
        setErrorMisTurnos('No se pudieron cargar tus turnos.')
      } finally {
        if (!cancelled) setIsLoadingMisTurnos(false)
      }
    }
    void fetch()
    return () => {
      cancelled = true
    }
  }, [clienteId, version])

  const refetchMisTurnos = useCallback(() => setVersion((v) => v + 1), [])

  const cancelarTurno = useCallback(
    async (turnoId: string) => {
      try {
        await api.updateEstadoTurno(turnoId, 'CANCELADO' as EstadoTurno)
        refetchMisTurnos()
        return true
      } catch (error) {
        console.error('[useMisTurnos.cancelar]', error)
        setErrorMisTurnos('No se pudo cancelar el turno.')
        return false
      }
    },
    [refetchMisTurnos],
  )

  return {
    turnos: clienteId ? turnos : [],
    isLoadingMisTurnos,
    errorMisTurnos,
    refetchMisTurnos,
    cancelarTurno,
  }
}
