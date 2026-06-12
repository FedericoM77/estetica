import { useMemo, useState, type FormEvent } from 'react'
import { parse, startOfDay } from 'date-fns'
import { useServices } from '../../hooks/useServices'
import { useProfessionals } from '../../hooks/useProfessionals'
import { useAvailability } from '../../hooks/useAvailability'
import { useCreateTurno } from '../../hooks/useCreateTurno'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input, Select } from '../ui/Input'

interface ManualTurnoFormProps {
  onCreated: () => void
}

/** Form para que la recepcionista cargue un turno tomado por teléfono. */
export function ManualTurnoForm({ onCreated }: ManualTurnoFormProps) {
  const [servicioId, setServicioId] = useState('')
  const [profesionalId, setProfesionalId] = useState('')
  const [fechaStr, setFechaStr] = useState('')
  const [slotIso, setSlotIso] = useState('')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [notas, setNotas] = useState('')
  const [mensajeOk, setMensajeOk] = useState<string | null>(null)

  const { services } = useServices()
  const { professionals } = useProfessionals(servicioId || null)
  const { createTurno, isCreatingTurno, errorCreateTurno } = useCreateTurno()

  const servicio = services.find((s) => s.id === servicioId) ?? null
  const fecha = useMemo(
    () => (fechaStr ? startOfDay(parse(fechaStr, 'yyyy-MM-dd', new Date())) : null),
    [fechaStr],
  )
  const { slots, isLoadingAvailability } = useAvailability(
    profesionalId || null,
    fecha,
    servicio?.duracion_minutos ?? null,
  )

  const formCompleto =
    servicioId && profesionalId && slotIso && nombre.trim() && telefono.trim() && email.trim()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setMensajeOk(null)
    if (!formCompleto) return

    const result = await createTurno({
      cliente: { nombre, telefono, email },
      profesionalId,
      servicioId,
      fechaHora: slotIso,
      notas: notas.trim() || undefined,
    })

    if (result) {
      setMensajeOk('Turno creado correctamente.')
      setSlotIso('')
      setNombre('')
      setTelefono('')
      setEmail('')
      setNotas('')
      onCreated()
    }
  }

  return (
    <Card>
      <h3 className="mb-4 font-display text-xl text-ink">Cargar turno manual</h3>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Select
          label="Servicio"
          value={servicioId}
          onChange={(e) => {
            setServicioId(e.target.value)
            setProfesionalId('')
            setSlotIso('')
          }}
        >
          <option value="">Seleccionar…</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre} ({s.duracion_minutos} min)
            </option>
          ))}
        </Select>

        <Select
          label="Profesional"
          value={profesionalId}
          onChange={(e) => {
            setProfesionalId(e.target.value)
            setSlotIso('')
          }}
          disabled={!servicioId}
        >
          <option value="">Seleccionar…</option>
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </Select>

        <Input
          label="Fecha"
          type="date"
          value={fechaStr}
          onChange={(e) => {
            setFechaStr(e.target.value)
            setSlotIso('')
          }}
          disabled={!profesionalId}
        />

        <Select
          label={isLoadingAvailability ? 'Horario (cargando…)' : 'Horario'}
          value={slotIso}
          onChange={(e) => setSlotIso(e.target.value)}
          disabled={!fecha || isLoadingAvailability}
        >
          <option value="">Seleccionar…</option>
          {slots
            .filter((s) => s.disponible)
            .map((s) => (
              <option key={s.fechaHora} value={s.fechaHora}>
                {s.label}
              </option>
            ))}
        </Select>

        <Input
          label="Nombre del paciente"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <Input
          label="Teléfono"
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input label="Notas (opcional)" value={notas} onChange={(e) => setNotas(e.target.value)} />

        <div className="flex items-end">
          <Button type="submit" disabled={!formCompleto || isCreatingTurno}>
            {isCreatingTurno ? 'Creando…' : 'Crear turno'}
          </Button>
        </div>
      </form>

      {errorCreateTurno && <p className="mt-3 text-sm text-error">{errorCreateTurno}</p>}
      {mensajeOk && <p className="mt-3 text-sm text-success">{mensajeOk}</p>}
    </Card>
  )
}
