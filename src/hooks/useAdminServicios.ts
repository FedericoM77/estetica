import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Servicio, ServicioInput } from '../types'

/** ABM de tratamientos (servicios), incluyendo inactivos. */
export function useAdminServicios() {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [isLoadingServicios, setIsLoadingServicios] = useState(true)
  const [errorServicios, setErrorServicios] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function fetch() {
      try {
        const data = await api.getServiciosAdmin()
        if (cancelled) return
        setServicios(data)
        setErrorServicios(null)
      } catch (error) {
        if (cancelled) return
        console.error('[useAdminServicios]', error)
        setErrorServicios('No se pudieron cargar los tratamientos.')
      } finally {
        if (!cancelled) setIsLoadingServicios(false)
      }
    }
    void fetch()
    return () => {
      cancelled = true
    }
  }, [version])

  const refetch = useCallback(() => setVersion((v) => v + 1), [])

  const crear = useCallback(
    async (input: ServicioInput) => {
      await api.crearServicio(input)
      refetch()
    },
    [refetch],
  )

  const actualizar = useCallback(
    async (id: string, input: ServicioInput) => {
      await api.actualizarServicio(id, input)
      refetch()
    },
    [refetch],
  )

  const eliminar = useCallback(
    async (id: string) => {
      await api.eliminarServicio(id)
      refetch()
    },
    [refetch],
  )

  return { servicios, isLoadingServicios, errorServicios, refetch, crear, actualizar, eliminar }
}
