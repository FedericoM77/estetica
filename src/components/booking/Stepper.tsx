const pasos = ['Servicio', 'Profesional', 'Fecha y hora', 'Confirmación']

export function Stepper({ pasoActual }: { pasoActual: number }) {
  return (
    <ol className="mb-8 flex items-center justify-center gap-2 sm:gap-4">
      {pasos.map((nombre, i) => {
        const numero = i + 1
        const activo = numero === pasoActual
        const completado = numero < pasoActual
        return (
          <li key={nombre} className="flex items-center gap-2 sm:gap-4">
            {i > 0 && <span className="h-px w-4 bg-line sm:w-8" />}
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium transition-colors duration-150 ${
                  activo
                    ? 'border-gold bg-gold text-base'
                    : completado
                      ? 'border-gold text-gold'
                      : 'border-line text-muted'
                }`}
              >
                {completado ? '✓' : numero}
              </span>
              <span
                className={`hidden text-xs sm:block ${activo ? 'text-ink' : 'text-muted'}`}
              >
                {nombre}
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
