import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Metricas } from '../types'

/** Métricas agregadas para el dashboard del admin. */
export function useMetricas() {
  const [metricas, setMetricas] = useState<Metricas | null>(null)
  const [isLoadingMetricas, setIsLoadingMetricas] = useState(true)
  const [errorMetricas, setErrorMetricas] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetch() {
      try {
        const data = await api.getMetricas()
        if (cancelled) return
        setMetricas(data)
        setErrorMetricas(null)
      } catch (error) {
        if (cancelled) return
        console.error('[useMetricas]', error)
        setErrorMetricas('No se pudieron cargar las métricas.')
      } finally {
        if (!cancelled) setIsLoadingMetricas(false)
      }
    }
    void fetch()
    return () => {
      cancelled = true
    }
  }, [])

  return { metricas, isLoadingMetricas, errorMetricas }
}
