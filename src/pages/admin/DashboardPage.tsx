const navItems = ['Agenda', 'Clientes', 'Tratamientos', 'Caja/Ventas', 'Configuracion']

const kpis = [
  { label: 'Turnos de hoy', value: '18', detail: '+12% vs ayer' },
  { label: 'Ingresos del dia', value: '$ 482.000', detail: '7 pagos cerrados' },
  { label: 'Pacientes nuevos', value: '6', detail: '3 primeras consultas' },
] as const

const appointments = [
  {
    time: '09:00',
    patient: 'Valentina Ruiz',
    treatment: 'Limpieza Facial Profunda',
    professional: 'Dra. Camila Torres',
    status: 'Confirmado',
    className:
      'border-violet-200/70 bg-violet-50/80 text-violet-950 dark:border-sky-500/40 dark:bg-sky-500/12 dark:text-sky-100',
  },
  {
    time: '10:30',
    patient: 'Martina Soler',
    treatment: 'Toxina Botulinica',
    professional: 'Dr. Nicolas Pereyra',
    status: 'En Tratamiento',
    className:
      'border-emerald-200/70 bg-emerald-50/70 text-emerald-950 dark:border-emerald-400/40 dark:bg-emerald-400/12 dark:text-emerald-100',
  },
  {
    time: '12:00',
    patient: 'Lucia Medina',
    treatment: 'Dermapen + Serum',
    professional: 'Lic. Ana Beltran',
    status: 'Pendiente de Pago',
    className:
      'border-amber-200/80 bg-amber-50/80 text-amber-950 dark:border-amber-300/40 dark:bg-amber-300/12 dark:text-amber-100',
  },
  {
    time: '14:30',
    patient: 'Sofia Herrera',
    treatment: 'Peeling Quimico Suave',
    professional: 'Dra. Camila Torres',
    status: 'Cancelado',
    className:
      'border-rose-200/80 bg-rose-50/80 text-rose-950 dark:border-rose-400/40 dark:bg-rose-400/12 dark:text-rose-100',
  },
]

const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']

function KpiCard({ label, value, detail }: (typeof kpis)[number]) {
  return (
    <article className="min-w-0 rounded-xl border border-zinc-200/60 bg-white p-5 font-sans shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-sm font-medium leading-5 text-zinc-500 dark:text-zinc-400">
          {label}
        </p>
        <span className="shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400">Hoy</span>
      </div>
      <p className="mt-4 break-words font-sans text-[clamp(1.75rem,2.8vw,2.25rem)] font-bold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{detail}</p>
    </article>
  )
}

export function DashboardPage() {
  return (
    <section>
      <div className="overflow-hidden rounded-xl border border-zinc-200/60 bg-zinc-50 font-sans text-zinc-900 shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
        <header className="flex flex-col gap-4 border-b border-zinc-200/60 bg-white/90 px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between xl:pr-44 dark:border-zinc-800 dark:bg-zinc-950/80">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.24em] text-violet-600 dark:text-[#E6C687]">
              CRM medico-premium
            </p>
            <h1 className="mt-2 font-display text-3xl font-medium tracking-wide text-zinc-800 dark:text-zinc-50">
              Clinica Aura Visual & Bienestar
            </h1>
          </div>
        </header>

        <div className="grid min-h-[760px] grid-cols-1 xl:grid-cols-[240px_minmax(0,1fr)_320px]">
          <aside className="border-b border-zinc-200/60 bg-white px-4 py-5 xl:border-b-0 xl:border-r dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-7 rounded-xl border border-violet-100 bg-violet-50/70 p-4 dark:border-amber-300/20 dark:bg-white/5">
              <p className="font-display text-lg font-medium uppercase tracking-widest text-zinc-800 dark:text-[#E6C687]">
                AURUM CRM
              </p>
              <p className="mt-1 font-sans text-xs text-zinc-500 dark:text-zinc-400">
                Consultorio Norte
              </p>
            </div>
            <nav className="space-y-1" aria-label="Navegacion CRM">
              {navItems.map((item, index) => (
                <a
                  key={item}
                  href="#"
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    index === 0
                      ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-sm shadow-violet-500/20 dark:bg-zinc-800 dark:bg-none dark:text-[#E6C687] dark:shadow-none'
                      : 'text-zinc-600 hover:bg-violet-50 hover:text-violet-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                  }`}
                >
                  {item}
                  {index === 0 && <span className="h-2 w-2 rounded-full bg-amber-300" />}
                </a>
              ))}
            </nav>
          </aside>

          <main className="min-w-0 bg-zinc-50 p-4 sm:p-5 dark:bg-zinc-950">
            <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {kpis.map((kpi) => (
                <KpiCard key={kpi.label} {...kpi} />
              ))}
            </div>

            <section className="mt-5 rounded-xl border border-zinc-200/60 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
              <div className="flex flex-col gap-3 border-b border-zinc-200/60 px-5 py-4 md:flex-row md:items-center md:justify-between dark:border-zinc-800">
                <div>
                  <h2 className="font-display text-2xl font-medium tracking-wide text-zinc-800 dark:text-zinc-50">
                    Agenda del dia
                  </h2>
                  <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400">
                    Viernes 19 de junio - Boxes 1 a 4
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-medium">
                  {['Confirmado', 'En Tratamiento', 'Cancelado', 'Pendiente de Pago'].map(
                    (label) => (
                      <span
                        key={label}
                        className="rounded-full border border-zinc-200/70 px-3 py-1 font-sans text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
                      >
                        {label}
                      </span>
                    ),
                  )}
                </div>
              </div>

              <div className="grid grid-cols-[72px_minmax(0,1fr)]">
                <div className="border-r border-zinc-100 dark:border-zinc-800">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="h-20 border-b border-zinc-100 px-4 py-3 font-sans text-xs font-semibold tracking-wider text-zinc-400 dark:border-zinc-800 dark:text-zinc-500"
                    >
                      {hour}
                    </div>
                  ))}
                </div>
                <div className="relative min-h-[640px] p-4">
                  <div className="absolute inset-x-0 top-20 border-t border-dashed border-zinc-100 dark:border-zinc-800" />
                  <div className="absolute inset-x-0 top-40 border-t border-dashed border-zinc-100 dark:border-zinc-800" />
                  <div className="absolute inset-x-0 top-60 border-t border-dashed border-zinc-100 dark:border-zinc-800" />

                  <div className="grid gap-3">
                    {appointments.map((appointment) => (
                      <article
                        key={`${appointment.time}-${appointment.patient}`}
                        className={`rounded-xl border p-4 ${appointment.className}`}
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
                              {appointment.time}
                            </p>
                            <h3 className="mt-1 font-sans text-base font-semibold">
                              {appointment.patient}
                            </h3>
                            <p className="mt-1 text-sm opacity-80">{appointment.treatment}</p>
                            <p className="mt-2 text-xs opacity-70">{appointment.professional}</p>
                          </div>
                          <span className="w-fit rounded-full bg-white/75 px-3 py-1 text-xs font-semibold shadow-sm dark:bg-slate-950/45">
                            {appointment.status}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </main>

          <aside className="border-t border-zinc-200/60 bg-white p-5 xl:border-l xl:border-t-0 dark:border-zinc-800 dark:bg-zinc-900">
            <section className="rounded-xl border border-zinc-200/60 p-5 shadow-sm dark:border-zinc-800 dark:shadow-none">
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.24em] text-violet-600 dark:text-[#E6C687]">
                Ficha rapida
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-violet-600 text-sm font-bold text-white shadow-sm shadow-violet-500/20">
                  MR
                </div>
                <div>
                  <h2 className="font-sans font-semibold text-zinc-950 dark:text-zinc-50">
                    Martina Rodriguez
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Paciente VIP</p>
                </div>
              </div>

              <dl className="mt-6 space-y-4 text-sm">
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">Ultimo tratamiento</dt>
                  <dd className="mt-1 font-medium text-zinc-950 dark:text-zinc-50">
                    Toxina Botulinica
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">Proximo control</dt>
                  <dd className="mt-1 font-medium text-zinc-950 dark:text-zinc-50">
                    26 Jun - 11:00
                  </dd>
                </div>
              </dl>

              <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-100">
                <p className="text-xs font-semibold uppercase tracking-[0.18em]">Alerta medica</p>
                <p className="mt-2 text-sm">Alergias: Acido hialuronico</p>
              </div>

              <button className="mt-5 w-full rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 px-4 py-3 font-sans text-sm font-semibold text-white shadow-sm shadow-violet-500/20 transition hover:from-purple-600 hover:to-violet-700 dark:bg-gradient-to-r dark:from-zinc-800 dark:to-purple-950 dark:text-[#E6C687] dark:hover:from-zinc-700 dark:hover:to-purple-900">
                Ver historia clinica
              </button>
            </section>
          </aside>
        </div>
      </div>
    </section>
  )
}
