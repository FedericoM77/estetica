import { useServices } from '../../hooks/useServices'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { toServiceCardDTO } from '../../lib/format'
import type { ServiceCardDTO, Servicio } from '../../types'

interface StepServiceProps {
  servicioSeleccionado: Servicio | null
  onSelect: (servicio: Servicio) => void
  onNext: () => void
}

function PriceLabel({ label }: { label: string }) {
  if (label === 'A consultar') {
    return (
      <span className="font-sans text-sm font-medium text-amber-700/80 dark:text-[#E6C687]">
        {label}
      </span>
    )
  }

  const isVariablePrice = label.startsWith('desde ')
  const amount = isVariablePrice ? label.replace(/^desde\s+/, '') : label

  return (
    <span className="font-sans text-sm font-semibold text-amber-700/80 dark:text-[#E6C687]">
      {isVariablePrice && (
        <span className="mr-1 font-normal text-amber-700/70 dark:text-[#E6C687]/80">
          desde
        </span>
      )}
      {amount}
    </span>
  )
}

function ServiceCardContent({ card }: { card: ServiceCardDTO }) {
  return (
    <>
      <h3 className="font-sans text-base font-semibold leading-6 text-zinc-800 dark:text-zinc-50">
        {card.title}
      </h3>
      {card.description && (
        <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {card.description}
        </p>
      )}
      <div className="mt-auto flex items-baseline justify-between gap-4 pt-5">
        <PriceLabel label={card.priceLabel} />
        <span className="font-sans text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          {card.durationLabel}
        </span>
      </div>
    </>
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
        {services.map((servicio) => {
          const card = toServiceCardDTO(servicio)

          return (
            <Card
              key={card.id}
              selectable
              selected={servicioSeleccionado?.id === servicio.id}
              onClick={() => onSelect(servicio)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(servicio)}
              className="flex min-h-44 flex-col"
            >
              <ServiceCardContent card={card} />
            </Card>
          )
        })}
      </div>
      <div className="mt-8 flex justify-end">
        <Button onClick={onNext} disabled={!servicioSeleccionado}>
          Continuar
        </Button>
      </div>
    </div>
  )
}
