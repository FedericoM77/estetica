const pasos = ['Servicio', 'Profesional', 'Fecha y hora', 'Confirmacion']

export function Stepper({ pasoActual }: { pasoActual: number }) {
  return (
    <ol className="mb-10 flex items-center justify-center gap-2 font-sans sm:gap-4">
      {pasos.map((nombre, i) => {
        const numero = i + 1
        const activo = numero === pasoActual
        const completado = numero < pasoActual

        return (
          <li key={nombre} className="flex items-center gap-2 sm:gap-4">
            {i > 0 && (
              <span
                className={`h-px w-5 sm:w-10 ${
                  completado || activo ? 'bg-amber-300/70' : 'bg-amber-100/70 dark:bg-zinc-800'
                }`}
              />
            )}
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-300 ${
                  activo
                    ? 'border-amber-300 bg-gradient-to-br from-amber-300 to-amber-600 text-white shadow-sm shadow-amber-200/70'
                    : completado
                      ? 'border-amber-300/80 bg-white/55 text-amber-700 dark:bg-white/5 dark:text-amber-200'
                      : 'border-amber-100/80 bg-white/35 text-zinc-400 dark:border-zinc-800 dark:bg-white/5 dark:text-zinc-500'
                }`}
              >
                {completado ? '✓' : numero}
              </span>
              <span
                className={`hidden text-xs font-medium sm:block ${
                  activo ? 'text-zinc-800 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-500'
                }`}
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
