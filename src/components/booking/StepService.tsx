import { useServices } from '../../hooks/useServices'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { formatPrecio } from '../../lib/format'
import type { Servicio } from '../../types'

interface StepServiceProps {
  servicioSeleccionado: Servicio | null
  onSelect: (servicio: Servicio) => void
  onNext: () => void
}

export function StepService({ servicioSeleccionado, onSelect, onNext }: StepServiceProps) {
  const { services, isLoadingServices, errorServices } = useServices()

  if (isLoadingServices) return <Spinner label="Cargando servicios…" />
  if (errorServices) return <p className="py-10 text-center text-error">{errorServices}</p>

  return (
    <div className="animate-step-in">
      <h2 className="mb-6 text-center font-display text-2xl font-light text-ink">
        Elegí tu especialidad o tratamiento
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((servicio) => (
          <Card
            key={servicio.id}
            selectable
            selected={servicioSeleccionado?.id === servicio.id}
            onClick={() => onSelect(servicio)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(servicio)}
          >
            <h3 className="font-display text-xl text-ink">{servicio.nombre}</h3>
            {servicio.descripcion && (
              <p className="mt-2 text-sm leading-relaxed text-muted">{servicio.descripcion}</p>
            )}
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-display text-lg text-gold">{formatPrecio(servicio)}</span>
              <span className="text-xs uppercase tracking-wider text-muted">
                {servicio.duracion_minutos} min
              </span>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex justify-end">
        <Button onClick={onNext} disabled={!servicioSeleccionado}>
          Continuar
        </Button>
      </div>
    </div>
  )
}
