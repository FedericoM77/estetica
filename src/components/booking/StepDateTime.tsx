import { useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { useAvailability } from '../../hooks/useAvailability'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import type { Slot } from '../../types'

interface StepDateTimeProps {
  profesionalId: string
  duracionMinutos: number
  fechaSeleccionada: Date | null
  slotSeleccionado: Slot | null
  onSelectFecha: (fecha: Date) => void
  onSelectSlot: (slot: Slot) => void
  onNext: () => void
  onBack: () => void
}

const diasSemana = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export function StepDateTime({
  profesionalId,
  duracionMinutos,
  fechaSeleccionada,
  slotSeleccionado,
  onSelectFecha,
  onSelectSlot,
  onNext,
  onBack,
}: StepDateTimeProps) {
  const [mesVisible, setMesVisible] = useState(() => startOfMonth(fechaSeleccionada ?? new Date()))
  const { slots, isLoadingAvailability, errorAvailability } = useAvailability(
    profesionalId,
    fechaSeleccionada,
    duracionMinutos,
  )

  const hoy = startOfDay(new Date())
  const dias = eachDayOfInterval({
    start: startOfWeek(startOfMonth(mesVisible), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(mesVisible), { weekStartsOn: 1 }),
  })

  return (
    <div className="animate-step-in">
      <h2 className="mb-6 text-center font-display text-2xl font-light text-ink">
        Elegí fecha y hora
      </h2>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Calendario mensual */}
        <div className="rounded-card border border-line bg-surface p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMesVisible((m) => addMonths(m, -1))}
              className="rounded-btn px-3 py-1 text-muted transition-colors hover:text-ink"
              aria-label="Mes anterior"
            >
              ←
            </button>
            <span className="font-display text-lg capitalize text-ink">
              {format(mesVisible, 'MMMM yyyy', { locale: es })}
            </span>
            <button
              type="button"
              onClick={() => setMesVisible((m) => addMonths(m, 1))}
              className="rounded-btn px-3 py-1 text-muted transition-colors hover:text-ink"
              aria-label="Mes siguiente"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {diasSemana.map((d, i) => (
              <span key={i} className="py-1 text-xs text-muted">
                {d}
              </span>
            ))}
            {dias.map((dia) => {
              const deshabilitado = isBefore(dia, hoy) || !isSameMonth(dia, mesVisible)
              const seleccionado = fechaSeleccionada && isSameDay(dia, fechaSeleccionada)
              return (
                <button
                  key={dia.toISOString()}
                  type="button"
                  disabled={deshabilitado}
                  onClick={() => onSelectFecha(dia)}
                  className={`aspect-square rounded-btn text-sm transition-colors duration-150 ${
                    seleccionado
                      ? 'bg-gold font-medium text-base'
                      : deshabilitado
                        ? 'text-line'
                        : 'text-ink hover:bg-line'
                  }`}
                >
                  {format(dia, 'd')}
                </button>
              )
            })}
          </div>
        </div>

        {/* Horarios disponibles */}
        <div>
          {!fechaSeleccionada && (
            <p className="py-10 text-center text-sm text-muted">
              Seleccioná un día para ver los horarios disponibles.
            </p>
          )}
          {fechaSeleccionada && isLoadingAvailability && (
            <Spinner label="Consultando disponibilidad…" />
          )}
          {fechaSeleccionada && errorAvailability && (
            <p className="py-10 text-center text-error">{errorAvailability}</p>
          )}
          {fechaSeleccionada && !isLoadingAvailability && !errorAvailability && (
            <>
              <p className="mb-3 text-sm capitalize text-muted">
                {format(fechaSeleccionada, "EEEE d 'de' MMMM", { locale: es })}
              </p>
              {slots.every((s) => !s.disponible) ? (
                <p className="py-6 text-center text-sm text-muted">
                  No quedan horarios disponibles para este día.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((slot) => (
                    <button
                      key={slot.fechaHora}
                      type="button"
                      disabled={!slot.disponible}
                      onClick={() => onSelectSlot(slot)}
                      className={`rounded-btn border py-2 text-sm transition-colors duration-150 ${
                        slotSeleccionado?.fechaHora === slot.fechaHora
                          ? 'border-gold bg-gold font-medium text-base'
                          : slot.disponible
                            ? 'border-line text-ink hover:border-gold'
                            : 'cursor-not-allowed border-line text-line line-through'
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Volver
        </Button>
        <Button onClick={onNext} disabled={!slotSeleccionado}>
          Continuar
        </Button>
      </div>
    </div>
  )
}
