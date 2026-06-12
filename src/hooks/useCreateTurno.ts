import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Cliente, DatosCliente, Turno } from '../types'

interface CrearTurnoInput {
  cliente: DatosCliente
  profesionalId: string
  servicioId: string
  /** ISO string del inicio del turno */
  fechaHora: string
  notas?: string
}

export interface CrearTurnoResult {
  turno: Turno
  cliente: Cliente
}

/** Código Postgres de violación de unique constraint. */
const UNIQUE_VIOLATION = '23505'

/**
 * Crea un turno CONFIRMADO:
 * 1. Busca el cliente por teléfono; si no existe lo crea, si existe
 *    actualiza nombre/email con los datos más recientes.
 * 2. Inserta el turno. La constraint unique_profesional_agenda en DB
 *    es la defensa real contra doble reserva del mismo horario.
 */
export function useCreateTurno() {
  const [isCreatingTurno, setIsCreatingTurno] = useState(false)
  const [errorCreateTurno, setErrorCreateTurno] = useState<string | null>(null)

  async function createTurno(input: CrearTurnoInput): Promise<CrearTurnoResult | null> {
    setIsCreatingTurno(true)
    setErrorCreateTurno(null)

    try {
      // 1. Upsert manual de cliente por teléfono
      const telefono = input.cliente.telefono.trim()
      const { data: existentes, error: errorBusqueda } = await supabase
        .from('clientes')
        .select('*')
        .eq('telefono', telefono)
        .limit(1)

      if (errorBusqueda) throw errorBusqueda

      let cliente: Cliente
      if (existentes && existentes.length > 0) {
        const { data: actualizado, error: errorUpdate } = await supabase
          .from('clientes')
          .update({ nombre: input.cliente.nombre.trim(), email: input.cliente.email.trim() })
          .eq('id', (existentes[0] as Cliente).id)
          .select()
          .single()
        if (errorUpdate) throw errorUpdate
        cliente = actualizado as Cliente
      } else {
        const { data: creado, error: errorInsert } = await supabase
          .from('clientes')
          .insert({
            nombre: input.cliente.nombre.trim(),
            telefono,
            email: input.cliente.email.trim(),
          })
          .select()
          .single()
        if (errorInsert) throw errorInsert
        cliente = creado as Cliente
      }

      // 2. Insert del turno
      const { data: turno, error: errorTurno } = await supabase
        .from('turnos')
        .insert({
          cliente_id: cliente.id,
          profesional_id: input.profesionalId,
          servicio_id: input.servicioId,
          fecha_hora: input.fechaHora,
          estado: 'CONFIRMADO',
          notas: input.notas ?? null,
        })
        .select()
        .single()

      if (errorTurno) {
        if (errorTurno.code === UNIQUE_VIOLATION) {
          setErrorCreateTurno(
            'Ese horario acaba de ser reservado por otra persona. Elegí otro horario.',
          )
          return null
        }
        throw errorTurno
      }

      return { turno: turno as Turno, cliente }
    } catch (error) {
      console.error('[useCreateTurno]', error)
      setErrorCreateTurno('No se pudo confirmar el turno. Intentá de nuevo.')
      return null
    } finally {
      setIsCreatingTurno(false)
    }
  }

  return { createTurno, isCreatingTurno, errorCreateTurno }
}
