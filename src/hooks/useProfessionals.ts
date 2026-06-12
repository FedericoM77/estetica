import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Profesional } from '../types'

/**
 * Profesionales activos que realizan el servicio dado.
 * Si `servicioId` es null devuelve todos los activos (uso en AdminPage).
 */
export function useProfessionals(servicioId: string | null) {
  const [professionals, setProfessionals] = useState<Profesional[]>([])
  const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(true)
  const [errorProfessionals, setErrorProfessionals] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchProfessionals() {
      setIsLoadingProfessionals(true)
      setErrorProfessionals(null)

      let query = supabase.from('profesionales').select(
        servicioId ? '*, profesional_servicios!inner(servicio_id)' : '*',
      )
      query = query.eq('activo', true)
      if (servicioId) {
        query = query.eq('profesional_servicios.servicio_id', servicioId)
      }
      const { data, error } = await query.order('nombre')

      if (cancelled) return

      if (error) {
        setErrorProfessionals('No se pudieron cargar los profesionales. Intentá de nuevo.')
        console.error('[useProfessionals]', error)
      } else {
        setProfessionals((data ?? []) as unknown as Profesional[])
      }
      setIsLoadingProfessionals(false)
    }

    void fetchProfessionals()
    return () => {
      cancelled = true
    }
  }, [servicioId])

  return { professionals, isLoadingProfessionals, errorProfessionals }
}
