import { useServices } from '../../hooks/useServices'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import type { Servicio } from '../../types'

interface StepServiceProps {
  servicioSeleccionado: Servicio | null
  onSelect: (servicio: Servicio) => void
  onNext: () => void
}

const nfARS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

function PrecioServicio({ servicio }: { servicio: Servicio }) {
  if (servicio.precio == null) {
    return (
      <span className="font-sans text-sm font-medium text-amber-700/80 dark:text-[#E6C687]">
        A consultar
      </span>
    )
  }

  return (
    <span className="font-sans text-sm font-semibold text-amber-700/80 dark:text-[#E6C687]">
      {servicio.precio_desde && (
        <span className="mr-1 font-normal text-amber-700/70 dark:text-[#E6C687]/80">
          desde
        </span>
      )}
      {nfARS.format(servicio.precio)}
    </span>
  )
}

export function StepService({ servicioSeleccionado, onSelect, onNext }: StepServiceProps) {
  const { services, isLoadingServices, errorServices } = useServices()

  if (isLoadingServices) return <Spinner label="Cargando servicios…" />
  if (errorServices) return <p className="py-10 text-center text-error">{errorServices}</p>

  return (
    <div className="animate-step-in">
      <h2 className="mb-3 text-center font-display text-3xl font-medium tracking-wide text-zinc-800 dark:text-zinc-50">
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
            className="flex min-h-44 flex-col"
          >
            <h3 className="font-sans text-base font-semibold leading-6 text-zinc-800 dark:text-zinc-50">
              {servicio.nombre}
            </h3>
            {servicio.descripcion && (
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {servicio.descripcion}
              </p>
            )}
            <div className="mt-auto flex items-baseline justify-between gap-4 pt-5">
              <PrecioServicio servicio={servicio} />
              <span className="font-sans text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
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
