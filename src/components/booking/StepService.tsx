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
      <h2 className="mb-3 text-center font-display text-3xl font-light text-zinc-800 dark:text-zinc-50">
        Elegí tu especialidad o tratamiento
      </h2>
      <p className="mx-auto mb-8 max-w-2xl text-center text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        Selecciona el tratamiento ideal para tu momento de bienestar. La reserva es simple,
        privada y sin crear una cuenta.
      </p>
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
            <h3 className="font-display text-xl text-zinc-800 dark:text-zinc-50">
              {servicio.nombre}
            </h3>
            {servicio.descripcion && (
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {servicio.descripcion}
              </p>
            )}
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-display text-lg text-amber-700/80 dark:text-[#E6C687]">
                {formatPrecio(servicio)}
              </span>
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
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
