import type { Servicio } from '../types'

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
