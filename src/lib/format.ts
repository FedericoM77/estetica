import type { Servicio, Treatment } from '../types'

const nfARS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

/** "$20.000" / "desde $40.000" / "A consultar" según el servicio. */
export function formatPrecio(servicio: Pick<Servicio, 'precio' | 'precio_desde'>): string {
  if (servicio.precio == null) return 'A consultar'
  const monto = nfARS.format(servicio.precio)
  return servicio.precio_desde ? `desde ${monto}` : monto
}

export function toTreatment(servicio: Servicio): Treatment | null {
  if (servicio.precio == null) return null

  return {
    id: servicio.id,
    name: servicio.nombre,
    price: servicio.precio,
    isVariablePrice: servicio.precio_desde,
    durationMinutes: servicio.duracion_minutos,
    description: servicio.descripcion ?? undefined,
  }
}
