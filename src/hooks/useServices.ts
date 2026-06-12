import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Servicio } from '../types'

export function useServices() {
  const [services, setServices] = useState<Servicio[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [errorServices, setErrorServices] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchServices() {
      try {
        const data = await api.getServicios()
        if (cancelled) return
        setServices(data)
        setErrorServices(null)
      } catch (error) {
        if (cancelled) return
        console.error('[useServices]', error)
        setErrorServices('No se pudieron cargar los servicios. Intentá de nuevo.')
      } finally {
        if (!cancelled) setIsLoadingServices(false)
      }
    }

    void fetchServices()
    return () => {
      cancelled = true
    }
  }, [])

  return { services, isLoadingServices, errorServices }
}
