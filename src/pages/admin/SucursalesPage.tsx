import { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { api } from '../../lib/api'
import type { Sucursal } from '../../types'

/**
 * Vista de sucursales. El MVP opera un solo centro, por lo que es de sólo
 * lectura; el ABM completo queda para cuando se habilite multi-sucursal.
 */
export function SucursalesPage() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    api
      .getSucursales()
      .then((data) => {
        if (!cancelled) setSucursales(data)
      })
      .catch((err) => {
        console.error('[SucursalesPage]', err)
        if (!cancelled) setError('No se pudieron cargar las sucursales.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <h2 className="mb-6 font-display text-2xl font-light text-ink">Sucursales</h2>

      {isLoading && <Spinner label="Cargando sucursales…" />}
      {error && <p className="py-10 text-center text-error">{error}</p>}

      {!isLoading && !error && (
        <div className="grid gap-4 sm:grid-cols-2">
          {sucursales.map((s) => (
            <Card key={s.id}>
              <p className="font-display text-lg text-ink">{s.nombre}</p>
              <p className="mt-1 text-sm text-muted">{s.direccion}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
