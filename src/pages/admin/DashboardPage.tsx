import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { useMetricas } from '../../hooks/useMetricas'

function Metrica({ valor, label }: { valor: number; label: string }) {
  return (
    <Card>
      <p className="font-display text-3xl font-light text-gold">{valor}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-muted">{label}</p>
    </Card>
  )
}

export function DashboardPage() {
  const { metricas, isLoadingMetricas, errorMetricas } = useMetricas()

  return (
    <div>
      <h2 className="mb-6 font-display text-2xl font-light text-ink">Dashboard</h2>

      {isLoadingMetricas && <Spinner label="Cargando métricas…" />}
      {errorMetricas && <p className="py-10 text-center text-error">{errorMetricas}</p>}

      {metricas && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Metrica valor={metricas.turnosHoy} label="Turnos hoy" />
            <Metrica valor={metricas.turnosSemana} label="Turnos esta semana" />
            <Metrica valor={metricas.esteticistasActivos} label="Esteticistas activos" />
            <Metrica valor={metricas.tratamientosActivos} label="Tratamientos activos" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Metrica valor={metricas.confirmados} label="Confirmados (semana)" />
            <Metrica valor={metricas.completados} label="Completados (semana)" />
            <Metrica valor={metricas.cancelados} label="Cancelados (semana)" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top servicios */}
            <Card>
              <h3 className="mb-4 text-xs uppercase tracking-wider text-muted">
                Tratamientos más reservados
              </h3>
              {metricas.topServicios.length === 0 ? (
                <p className="text-sm text-line">Sin datos en el período.</p>
              ) : (
                <ul className="space-y-3">
                  {metricas.topServicios.map((s) => (
                    <li key={s.nombre} className="flex items-center justify-between text-sm">
                      <span className="text-ink">{s.nombre}</span>
                      <span className="font-display text-lg text-gold">{s.cantidad}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Próximos turnos */}
            <Card>
              <h3 className="mb-4 text-xs uppercase tracking-wider text-muted">Próximos turnos</h3>
              {metricas.proximosTurnos.length === 0 ? (
                <p className="text-sm text-line">No hay turnos próximos.</p>
              ) : (
                <ul className="space-y-3">
                  {metricas.proximosTurnos.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-3 text-sm">
                      <div>
                        <p className="text-ink">{t.cliente.nombre}</p>
                        <p className="text-xs text-muted">
                          {t.servicio.nombre} · {t.profesional.nombre}
                        </p>
                      </div>
                      <span className="whitespace-nowrap text-xs text-muted">
                        {format(new Date(t.fecha_hora), "d MMM HH:mm", { locale: es })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
