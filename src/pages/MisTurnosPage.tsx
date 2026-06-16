import { Link } from 'react-router-dom'
import { format, isAfter } from 'date-fns'
import { es } from 'date-fns/locale'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { useMisTurnos } from '../hooks/useMisTurnos'

export function MisTurnosPage() {
  const { usuario } = useAuth()
  const { turnos, isLoadingMisTurnos, errorMisTurnos, cancelarTurno } = useMisTurnos(
    usuario?.clienteId ?? null,
  )

  const ahora = new Date()

  return (
    <PageWrapper>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl font-light text-ink">Mis turnos</h2>
        <Link to="/">
          <Button>+ Reservar turno</Button>
        </Link>
      </div>

      {isLoadingMisTurnos && <Spinner label="Cargando tus turnos…" />}
      {errorMisTurnos && <p className="py-10 text-center text-error">{errorMisTurnos}</p>}

      {!isLoadingMisTurnos && !errorMisTurnos && (
        <ul className="space-y-3">
          {turnos.map((t) => {
            const fecha = new Date(t.fecha_hora)
            const esFuturo = isAfter(fecha, ahora)
            const cancelable = t.estado === 'CONFIRMADO' && esFuturo
            return (
              <li
                key={t.id}
                className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-display text-lg text-ink">{t.servicio.nombre}</p>
                  <p className="mt-0.5 text-sm capitalize text-muted">
                    {format(fecha, "EEEE d 'de' MMMM 'a las' HH:mm 'hs'", { locale: es })}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">con {t.profesional.nombre}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge estado={t.estado} />
                  {cancelable && (
                    <Button
                      variant="danger"
                      className="px-3 py-1.5 text-xs"
                      onClick={() => {
                        if (confirm('¿Cancelar este turno?')) void cancelarTurno(t.id)
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
          {turnos.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-muted">Todavía no tenés turnos reservados.</p>
              <Link to="/" className="mt-3 inline-block text-sm text-gold hover:underline">
                Reservá tu primer turno →
              </Link>
            </div>
          )}
        </ul>
      )}
    </PageWrapper>
  )
}
