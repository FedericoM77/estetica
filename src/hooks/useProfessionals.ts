import { useEffect, useState } from 'react'
import { api } from '../lib/api'
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
      try {
        const data = await api.getProfesionales(servicioId)
        if (cancelled) return
        setProfessionals(data)
        setErrorProfessionals(null)
      } catch (error) {
        if (cancelled) return
        console.error('[useProfessionals]', error)
        setErrorProfessionals('No se pudieron cargar los profesionales. Intentá de nuevo.')
      } finally {
        if (!cancelled) setIsLoadingProfessionals(false)
      }
    }

    void fetchProfessionals()
    return () => {
      cancelled = true
    }
  }, [servicioId])

  return { professionals, isLoadingProfessionals, errorProfessionals }
}
