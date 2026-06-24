export interface WhatsAppMensaje {
  telefono: string
  texto: string
}

export interface ConfirmacionTurnoMensaje {
  telefono: string
  nombreCliente: string
  servicio: string
  profesional: string
  fechaHoraLegible: string
  medioPago?: string
  destinatario: 'cliente' | 'profesional'
}

const gatewayUrl = import.meta.env.VITE_WHATSAPP_GATEWAY_URL as string | undefined
const gatewayToken = import.meta.env.VITE_WHATSAPP_TOKEN as string | undefined

function textoConfirmacion(mensaje: ConfirmacionTurnoMensaje): string {
  const pago = mensaje.medioPago ? `\nPago: ${mensaje.medioPago}` : ''
  if (mensaje.destinatario === 'profesional') {
    return [
      'Nuevo turno reservado en GlowDesk',
      `Paciente: ${mensaje.nombreCliente}`,
      `Tratamiento: ${mensaje.servicio}`,
      `Fecha: ${mensaje.fechaHoraLegible}`,
      pago.trim(),
    ]
      .filter(Boolean)
      .join('\n')
  }

  return [
    `Hola ${mensaje.nombreCliente}, tu turno en GlowDesk fue confirmado.`,
    `Tratamiento: ${mensaje.servicio}`,
    `Profesional: ${mensaje.profesional}`,
    `Fecha: ${mensaje.fechaHoraLegible}`,
    pago.trim(),
    'Te esperamos.',
  ]
    .filter(Boolean)
    .join('\n')
}

export async function enviarWhatsApp({ telefono, texto }: WhatsAppMensaje): Promise<void> {
  if (!gatewayUrl || !gatewayToken) {
    console.info('[whatsapp] Gateway no configurado, se omite el envio.', { telefono, texto })
    return
  }

  try {
    const response = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${gatewayToken}`,
      },
      body: JSON.stringify({ phone: telefono, message: texto }),
    })
    if (!response.ok) {
      throw new Error(`Gateway WhatsApp respondio ${response.status}`)
    }
  } catch (error) {
    console.error('[whatsapp] Error al enviar mensaje', error)
  }
}

export async function enviarConfirmacionTurno(
  mensaje: ConfirmacionTurnoMensaje,
): Promise<void> {
  await enviarWhatsApp({
    telefono: mensaje.telefono,
    texto: textoConfirmacion(mensaje),
  })
}
