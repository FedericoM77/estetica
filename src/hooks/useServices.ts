import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Servicio } from '../types'

export function useServices() {
  const [services, setServices] = useState<Servicio[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [errorServices, setErrorServices] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchServices() {
      setIsLoadingServices(true)
      setErrorServices(null)

      const { data, error } = await supabase
        .from('servicios')
        .select('*')
        .eq('activo', true)
        .order('nombre')

      if (cancelled) return

      if (error) {
        setErrorServices('No se pudieron cargar los servicios. Intentá de nuevo.')
        console.error('[useServices]', error)
      } else {
        setServices((data ?? []) as Servicio[])
      }
      setIsLoadingServices(false)
    }

    void fetchServices()
    return () => {
      cancelled = true
    }
  }, [])

  return { services, isLoadingServices, errorServices }
}
