import { useMemo, useState } from 'react'
import { addDays, addWeeks, eachDayOfInterval, format, isSameDay, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { ManualTurnoForm } from '../../components/admin/ManualTurnoForm'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { useProfessionals } from '../../hooks/useProfessionals'
import { useTurnos } from '../../hooks/useTurnos'
import type { EstadoTurno } from '../../types'

export function TurnosAdminPage() {
  const [inicioSemana, setInicioSemana] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  )
  const [filtroProfesional, setFiltroProfesional] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [mostrarFormManual, setMostrarFormManual] = useState(false)

  const { professionals } = useProfessionals(null)

  const filtros = useMemo(
    () => ({
      desde: inicioSemana.toISOString(),
      hasta: addWeeks(inicioSemana, 1).toISOString(),
      profesionalId: filtroProfesional || null,
      estado: (filtroEstado || null) as EstadoTurno | null,
    }),
    [inicioSemana, filtroProfesional, filtroEstado],
  )

  const { turnos, isLoadingTurnos, errorTurnos, refetchTurnos, updateEstado } = useTurnos(filtros)

  const diasSemana = eachDayOfInterval({
    start: inicioSemana,
    end: addDays(inicioSemana, 6),
  })

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-2xl font-light text-ink">Agenda semanal</h2>
        <Button variant="secondary" onClick={() => setMostrarFormManual((v) => !v)}>
          {mostrarFormManual ? 'Ocultar carga manual' : '+ Cargar turno manual'}
        </Button>
      </div>

      {mostrarFormManual && (
        <div className="mb-8">
          <ManualTurnoForm onCreated={() => void refetchTurnos()} />
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setInicioSemana((s) => addWeeks(s, -1))}>
            ← Anterior
          </Button>
          <span className="min-w-44 text-center text-sm capitalize text-muted">
            {format(inicioSemana, "d 'de' MMM", { locale: es })} —{' '}
            {format(addDays(inicioSemana, 6), "d 'de' MMM yyyy", { locale: es })}
          </span>
          <Button variant="secondary" onClick={() => setInicioSemana((s) => addWeeks(s, 1))}>
            Siguiente →
          </Button>
        </div>

        <div className="flex gap-3">
          <Select
            label="Profesional"
            value={filtroProfesional}
            onChange={(e) => setFiltroProfesional(e.target.value)}
            className="min-w-44"
          >
            <option value="">Todos</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </Select>
          <Select
            label="Estado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="min-w-36"
          >
            <option value="">Todos</option>
            <option value="CONFIRMADO">Confirmado</option>
            <option value="CANCELADO">Cancelado</option>
            <option value="COMPLETADO">Completado</option>
          </Select>
        </div>
      </div>

      {isLoadingTurnos && <Spinner label="Cargando agenda…" />}
      {errorTurnos && <p className="py-10 text-center text-error">{errorTurnos}</p>}

      {!isLoadingTurnos && !errorTurnos && (
        <div className="space-y-6">
          {diasSemana.map((dia) => {
            const turnosDelDia = turnos.filter((t) => isSameDay(new Date(t.fecha_hora), dia))
            return (
              <section key={dia.toISOString()}>
                <h3 className="mb-2 border-b border-line pb-2 text-sm capitalize text-muted">
                  {format(dia, "EEEE d 'de' MMMM", { locale: es })}
                  <span className="ml-2 text-gold">
                    {turnosDelDia.length > 0 && `(${turnosDelDia.length})`}
                  </span>
                </h3>
                {turnosDelDia.length === 0 ? (
                  <p className="py-2 text-xs text-line">Sin turnos</p>
                ) : (
                  <ul className="space-y-2">
                    {turnosDelDia.map((turno) => (
                      <li
                        key={turno.id}
                        className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-display text-xl text-gold">
                            {format(new Date(turno.fecha_hora), 'HH:mm')}
                          </span>
                          <div>
                            <p className="text-sm text-ink">
                              {turno.cliente.nombre}
                              <span className="ml-2 text-muted">{turno.cliente.telefono}</span>
                            </p>
                            <p className="mt-0.5 text-xs text-muted">
                              {turno.servicio.nombre} · {turno.profesional.nombre}
                              {turno.notas && <span className="italic"> · {turno.notas}</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge estado={turno.estado} />
                          {turno.estado === 'CONFIRMADO' && (
                            <>
                              <Button
                                variant="secondary"
                                className="px-3 py-1.5 text-xs"
                                onClick={() => void updateEstado(turno.id, 'COMPLETADO')}
                              >
                                Completar
                              </Button>
                              <Button
                                variant="danger"
                                className="px-3 py-1.5 text-xs"
                                onClick={() => void updateEstado(turno.id, 'CANCELADO')}
                              >
                                Cancelar
                              </Button>
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
