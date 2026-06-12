// Gateway de WhatsApp — módulo desacoplado, stub en el MVP.
// Cuando se active Z-API / Evolution API, este es el único archivo a tocar.

export interface ConfirmacionTurnoMensaje {
  telefono: string
  nombreCliente: string
  servicio: string
  profesional: string
  /** Fecha y hora ya formateadas para mostrar al paciente */
  fechaHoraLegible: string
}

const gatewayUrl = import.meta.env.VITE_WHATSAPP_GATEWAY_URL as string | undefined
const gatewayToken = import.meta.env.VITE_WHATSAPP_TOKEN as string | undefined

/**
 * Envía la confirmación de turno por WhatsApp.
 * Stub: si el gateway no está configurado, loguea y resuelve sin error.
 * Nunca debe romper el flujo de reserva — el turno ya está confirmado en DB.
 */
export async function enviarConfirmacionTurno(
  mensaje: ConfirmacionTurnoMensaje,
): Promise<void> {
  if (!gatewayUrl || !gatewayToken) {
    console.info('[whatsapp] Gateway no configurado, se omite el envío.', {
      telefono: mensaje.telefono,
      servicio: mensaje.servicio,
    })
    return
  }

  try {
    // TODO(v2): implementar contra Z-API / Evolution API.
    console.info('[whatsapp] Envío pendiente de implementación.', mensaje)
  } catch (error) {
    // El envío de notificación nunca debe abortar la reserva.
    console.error('[whatsapp] Error al enviar confirmación', error)
  }
}
