import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Sucursal, SucursalInput } from '../types'

export function useAdminSucursales() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [isLoadingSucursales, setIsLoadingSucursales] = useState(true)
  const [errorSucursales, setErrorSucursales] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function fetch() {
      try {
        const data = await api.getSucursales()
        if (cancelled) return
        setSucursales(data)
        setErrorSucursales(null)
      } catch (error) {
        if (cancelled) return
        console.error('[useAdminSucursales]', error)
        setErrorSucursales('No se pudieron cargar las sucursales.')
      } finally {
        if (!cancelled) setIsLoadingSucursales(false)
      }
    }
    void fetch()
    return () => {
      cancelled = true
    }
  }, [version])

  const refetch = useCallback(() => setVersion((v) => v + 1), [])

  const crear = useCallback(
    async (input: SucursalInput) => {
      await api.crearSucursal(input)
      refetch()
    },
    [refetch],
  )

  const actualizar = useCallback(
    async (id: string, input: SucursalInput) => {
      await api.actualizarSucursal(id, input)
      refetch()
    },
    [refetch],
  )

  const eliminar = useCallback(
    async (id: string) => {
      await api.eliminarSucursal(id)
      refetch()
    },
    [refetch],
  )

  return { sucursales, isLoadingSucursales, errorSucursales, crear, actualizar, eliminar }
}
