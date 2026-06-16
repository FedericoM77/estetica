import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { ProfesionalConServicios, ProfesionalInput, Servicio, Sucursal } from '../types'

/**
 * ABM de esteticistas (profesionales) con sus tratamientos asignados.
 * Trae además el catálogo de servicios y sucursales que necesita el form.
 */
export function useAdminProfesionales() {
  const [profesionales, setProfesionales] = useState<ProfesionalConServicios[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [isLoadingProfesionales, setIsLoadingProfesionales] = useState(true)
  const [errorProfesionales, setErrorProfesionales] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function fetch() {
      try {
        const [profs, servs, sucs] = await Promise.all([
          api.getProfesionalesAdmin(),
          api.getServiciosAdmin(),
          api.getSucursales(),
        ])
        if (cancelled) return
        setProfesionales(profs)
        setServicios(servs)
        setSucursales(sucs)
        setErrorProfesionales(null)
      } catch (error) {
        if (cancelled) return
        console.error('[useAdminProfesionales]', error)
        setErrorProfesionales('No se pudieron cargar los esteticistas.')
      } finally {
        if (!cancelled) setIsLoadingProfesionales(false)
      }
    }
    void fetch()
    return () => {
      cancelled = true
    }
  }, [version])

  const refetch = useCallback(() => setVersion((v) => v + 1), [])

  const crear = useCallback(
    async (input: ProfesionalInput) => {
      await api.crearProfesional(input)
      refetch()
    },
    [refetch],
  )

  const actualizar = useCallback(
    async (id: string, input: ProfesionalInput) => {
      await api.actualizarProfesional(id, input)
      refetch()
    },
    [refetch],
  )

  const eliminar = useCallback(
    async (id: string) => {
      await api.eliminarProfesional(id)
      refetch()
    },
    [refetch],
  )

  return {
    profesionales,
    servicios,
    sucursales,
    isLoadingProfesionales,
    errorProfesionales,
    refetch,
    crear,
    actualizar,
    eliminar,
  }
}
