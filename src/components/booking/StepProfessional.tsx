import { useEffect, useRef } from 'react'
import { useProfessionals } from '../../hooks/useProfessionals'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import type { Profesional } from '../../types'

interface StepProfessionalProps {
  servicioId: string
  profesionalSeleccionado: Profesional | null
  onSelect: (profesional: Profesional) => void
  /** Avance automático cuando hay un único profesional */
  onAutoSkip: (profesional: Profesional) => void
  onNext: () => void
  onBack: () => void
}

function inicialesDe(nombre: string): string {
  return nombre
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function StepProfessional({
  servicioId,
  profesionalSeleccionado,
  onSelect,
  onAutoSkip,
  onNext,
  onBack,
}: StepProfessionalProps) {
  const { professionals, isLoadingProfessionals, errorProfessionals } =
    useProfessionals(servicioId)
  const yaAutoSkipeado = useRef(false)

  useEffect(() => {
    if (!isLoadingProfessionals && professionals.length === 1 && !yaAutoSkipeado.current) {
      yaAutoSkipeado.current = true
      onAutoSkip(professionals[0])
    }
  }, [isLoadingProfessionals, professionals, onAutoSkip])

  if (isLoadingProfessionals) return <Spinner label="Cargando profesionales…" />
  if (errorProfessionals)
    return <p className="py-10 text-center text-error">{errorProfessionals}</p>

  if (professionals.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted">
          No hay profesionales disponibles para este servicio por el momento.
        </p>
        <Button variant="secondary" className="mt-6" onClick={onBack}>
          Volver
        </Button>
      </div>
    )
  }

  return (
    <div className="animate-step-in">
      <h2 className="mb-6 text-center font-display text-2xl font-light text-ink">
        Elegí tu profesional
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {professionals.map((profesional) => (
          <Card
            key={profesional.id}
            selectable
            selected={profesionalSeleccionado?.id === profesional.id}
            onClick={() => onSelect(profesional)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(profesional)}
            className="flex items-center gap-4"
          >
            {/* Placeholder de foto */}
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-line bg-base font-display text-lg text-gold">
              {inicialesDe(profesional.nombre)}
            </span>
            <div>
              <h3 className="font-display text-lg text-ink">{profesional.nombre}</h3>
              <p className="mt-0.5 text-sm text-muted">{profesional.especialidad}</p>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Volver
        </Button>
        <Button onClick={onNext} disabled={!profesionalSeleccionado}>
          Continuar
        </Button>
      </div>
    </div>
  )
}
