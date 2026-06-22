const navItems = ['Agenda', 'Clientes', 'Tratamientos', 'Caja/Ventas', 'Configuracion']

const kpis = [
  { label: 'Turnos de hoy', value: '18', detail: '+12% vs ayer', tone: 'sky' },
  { label: 'Ingresos del dia', value: '$ 482.000', detail: '7 pagos cerrados', tone: 'mint' },
  { label: 'Pacientes nuevos', value: '6', detail: '3 primeras consultas', tone: 'rose' },
] as const

const appointments = [
  {
    time: '09:00',
    patient: 'Valentina Ruiz',
    treatment: 'Limpieza Facial Profunda',
    professional: 'Dra. Camila Torres',
    status: 'Confirmado',
    className:
      'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/40 dark:bg-sky-500/12 dark:text-sky-100',
  },
  {
    time: '10:30',
    patient: 'Martina Soler',
    treatment: 'Toxina Botulinica',
    professional: 'Dr. Nicolas Pereyra',
    status: 'En Tratamiento',
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-400/40 dark:bg-emerald-400/12 dark:text-emerald-100',
  },
  {
    time: '12:00',
    patient: 'Lucia Medina',
    treatment: 'Dermapen + Serum',
    professional: 'Lic. Ana Beltran',
    status: 'Pendiente de Pago',
    className:
      'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-300/40 dark:bg-amber-300/12 dark:text-amber-100',
  },
  {
    time: '14:30',
    patient: 'Sofia Herrera',
    treatment: 'Peeling Quimico Suave',
    professional: 'Dra. Camila Torres',
    status: 'Cancelado',
    className:
      'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-400/40 dark:bg-rose-400/12 dark:text-rose-100',
  },
]

const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']

function KpiCard({ label, value, detail, tone }: (typeof kpis)[number]) {
  const tones = {
    sky: 'bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:bg-sky-400/10 dark:text-sky-200 dark:ring-sky-300/20',
    mint: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-200 dark:ring-emerald-300/20',
    rose: 'bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:bg-rose-400/10 dark:text-rose-200 dark:ring-rose-300/20',
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tones[tone]}`}>
          Hoy
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{detail}</p>
    </article>
  )
}

export function DashboardPage() {
  return (
    <section>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-slate-900 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55)] transition-colors dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
        <header className="flex flex-col gap-4 border-b border-slate-200 bg-white/80 px-5 py-4 pr-44 backdrop-blur md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-950/80">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-300">
              CRM medico-premium
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Clinica Aura Visual & Bienestar
            </h1>
          </div>
        </header>

        <div className="grid min-h-[760px] grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_320px]">
          <aside className="border-b border-slate-200 bg-white px-4 py-5 lg:border-b-0 lg:border-r dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-7 rounded-xl border border-sky-100 bg-sky-50 p-4 dark:border-sky-500/20 dark:bg-sky-500/10">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">AURUM CRM</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Consultorio Norte</p>
            </div>
            <nav className="space-y-1" aria-label="Navegacion CRM">
              {navItems.map((item, index) => (
                <a
                  key={item}
                  href="#"
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    index === 0
                      ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/25'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  {item}
                  {index === 0 && <span className="h-2 w-2 rounded-full bg-white" />}
                </a>
              ))}
            </nav>
          </aside>

          <main className="min-w-0 bg-slate-50 p-5 dark:bg-slate-950">
            <div className="grid gap-4 md:grid-cols-3">
              {kpis.map((kpi) => (
                <KpiCard key={kpi.label} {...kpi} />
              ))}
            </div>

            <section className="mt-5 rounded-xl border border-slate-200 bg-white shadow-[0_18px_45px_-32px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
              <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                    Agenda del dia
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Viernes 19 de junio - Boxes 1 a 4
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-medium">
                  {['Confirmado', 'En Tratamiento', 'Cancelado', 'Pendiente de Pago'].map(
                    (label) => (
                      <span
                        key={label}
                        className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                      >
                        {label}
                      </span>
                    ),
                  )}
                </div>
              </div>

              <div className="grid grid-cols-[72px_minmax(0,1fr)]">
                <div className="border-r border-slate-100 dark:border-slate-800">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="h-20 border-b border-slate-100 px-4 py-3 text-xs font-medium text-slate-400 dark:border-slate-800 dark:text-slate-500"
                    >
                      {hour}
                    </div>
                  ))}
                </div>
                <div className="relative min-h-[640px] p-4">
                  <div className="absolute inset-x-0 top-20 border-t border-dashed border-slate-100 dark:border-slate-800" />
                  <div className="absolute inset-x-0 top-40 border-t border-dashed border-slate-100 dark:border-slate-800" />
                  <div className="absolute inset-x-0 top-60 border-t border-dashed border-slate-100 dark:border-slate-800" />

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
                            <h3 className="mt-1 text-base font-semibold">{appointment.patient}</h3>
                            <p className="mt-1 text-sm opacity-80">{appointment.treatment}</p>
                            <p className="mt-2 text-xs opacity-70">{appointment.professional}</p>
                          </div>
                          <span className="w-fit rounded-full bg-white/70 px-3 py-1 text-xs font-semibold dark:bg-slate-950/45">
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

          <aside className="border-t border-slate-200 bg-white p-5 lg:border-l lg:border-t-0 dark:border-slate-800 dark:bg-slate-900">
            <section className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600 dark:text-sky-300">
                Ficha rapida
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-emerald-400 text-sm font-bold text-white">
                  MR
                </div>
                <div>
                  <h2 className="font-semibold text-slate-950 dark:text-white">Martina Rodriguez</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Paciente VIP</p>
                </div>
              </div>

              <dl className="mt-6 space-y-4 text-sm">
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Ultimo tratamiento</dt>
                  <dd className="mt-1 font-medium text-slate-950 dark:text-white">
                    Toxina Botulinica
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Proximo control</dt>
                  <dd className="mt-1 font-medium text-slate-950 dark:text-white">
                    26 Jun - 11:00
                  </dd>
                </div>
              </dl>

              <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-100">
                <p className="text-xs font-semibold uppercase tracking-[0.18em]">Alerta medica</p>
                <p className="mt-2 text-sm">Alergias: Acido hialuronico</p>
              </div>

              <button className="mt-5 w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-sky-500/25 transition hover:bg-sky-600 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300">
                Ver historia clinica
              </button>
            </section>
          </aside>
        </div>
      </div>
    </section>
  )
}
