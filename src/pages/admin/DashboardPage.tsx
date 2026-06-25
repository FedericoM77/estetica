import { useState } from 'react'

type ViewName = 'superadmin' | 'admin' | 'cliente'

const tabs: { id: ViewName; label: string }[] = [
  { id: 'superadmin', label: 'Vista SuperAdmin' },
  { id: 'admin', label: 'Vista Admin / Tenant' },
  { id: 'cliente', label: 'Vista Cliente' },
]

const kpis = [
  { label: 'Inquilinos Activos', value: '142' },
  { label: 'Modelos', value: '82 Clinicas · 60 Indep.' },
  { label: 'Facturacion Global', value: '$24.890.000' },
]

const tenants = [
  ['Clinica Aura', 'glowdesk.com.ar/clinica-aura', 'CLINIC', 'Activo', 'Susp.'],
  ['Dra. Rios Studio', 'glowdesk.com.ar/dra-rios', 'INDEPENDENT', 'Activo', 'Susp.'],
  ['Lirio Spa Medico', 'glowdesk.com.ar/lirio-spa', 'CLINIC', 'Inactivo', 'Act.'],
]

const adminKpis = [
  ['Turnos', '28'],
  ['Ingresos', '$842.000'],
  ['Nuevos', '6'],
]

const appointments = [
  ['09:00', 'Valeria Mendez · Limpieza Facial', 'Dra. Camila Torres', 'Box 2', 'sky'],
  ['10:30', 'Martina Soler · Dermapen + Serum', 'Lic. Ana Beltran', 'Box 1', 'emerald'],
  ['12:00', 'Lucia Medina · Toxina Botulinica', 'Dr. Nicolas Pereyra', 'Box 2', 'amber'],
]

const services = [
  ['Corte', 'desde $20.000', '45 MIN'],
  ['Limpieza Facial Profunda', 'desde $40.000', '90 MIN'],
  ['Dermapen', 'desde $55.000', '60 MIN'],
  ['Peeling Glow', '$45.000', '45 MIN'],
  ['Toxina Botulinica', 'desde $80.000', '30 MIN'],
  ['Alisados', 'desde $45.000', '120 MIN'],
]

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 13h7V4H4v9Zm9 7h7V4h-7v16ZM4 20h7v-5H4v5Z" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M7 2v3M17 2v3M4 9h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0ZM4 21a8 8 0 0 1 16 0" />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 3v18M3 12h18M7 7l10 10M17 7 7 17" />
    </svg>
  )
}

function CashIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 7h16v10H4zM7 11h4M16 12h1" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4" />
    </svg>
  )
}

function SuperAdminView() {
  return (
    <section className="space-y-2 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-[.2em] text-[#D4AF37]">
            GlowDesk / SuperAdmin
          </p>
          <h1 className="truncate text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Control global del negocio
          </h1>
        </div>
        <button className="rounded-full border border-[#D4AF37]/70 bg-white/65 px-3 py-1 text-[11px] font-bold text-zinc-800 shadow-[0_14px_34px_-28px_rgba(39,39,42,.34)] transition hover:bg-[#D4AF37]/10 dark:bg-zinc-900 dark:text-[#D4AF37]">
          Alta Manual
        </button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-2">
        {kpis.map((kpi) => (
          <article
            key={kpi.label}
            className="min-w-0 rounded-xl border border-white/80 bg-white/90 p-3 shadow-[0_14px_34px_-28px_rgba(39,39,42,.34)] backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/88"
          >
            <p className="truncate text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
              {kpi.label}
            </p>
            <p className="mt-1 min-w-0 truncate text-lg font-bold tracking-tight text-zinc-950 md:text-xl dark:text-zinc-50">
              {kpi.value}
            </p>
          </article>
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border border-white/80 bg-white/90 shadow-[0_14px_34px_-28px_rgba(39,39,42,.34)] backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/88">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
          <h2 className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-50">
            Centros registrados
          </h2>
          <span className="rounded-full bg-[#D4AF37]/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-[#D4AF37]">
            glowdesk.com.ar/:tenant_slug
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-zinc-100/70 text-[10px] uppercase tracking-wider text-zinc-500 dark:bg-zinc-950/40 dark:text-zinc-500">
              <tr>
                <th className="px-3 py-1.5 font-bold">Centro</th>
                <th className="px-3 py-1.5 font-bold">URL</th>
                <th className="px-3 py-1.5 font-bold">Tipo</th>
                <th className="px-3 py-1.5 font-bold">Estado</th>
                <th className="px-3 py-1.5 font-bold">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {tenants.map(([name, url, type, status, action]) => (
                <tr key={name}>
                  <td className="max-w-44 truncate px-3 py-2 font-bold">{name}</td>
                  <td className="max-w-64 truncate px-3 py-2 text-zinc-500">{url}</td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300">{type}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        status === 'Activo'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                        action === 'Susp.'
                          ? 'border-rose-200 text-rose-600 dark:border-rose-500/25 dark:text-rose-400'
                          : 'border-emerald-200 text-emerald-700 dark:border-emerald-500/25 dark:text-emerald-400'
                      }`}
                    >
                      {action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  )
}

function AdminTenantView() {
  const nav = [
    ['Dashboard', <DashboardIcon key="dashboard" />, 'bg-violet-50 text-violet-500 dark:bg-violet-500/10 dark:text-violet-300'],
    ['Agenda', <CalendarIcon key="agenda" />, 'bg-[#D4AF37]/15 text-amber-700 ring-1 ring-[#D4AF37]/40 dark:text-[#D4AF37]'],
    ['Clientes', <UserIcon key="clientes" />, 'bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-300'],
    ['Tratamientos', <SparkIcon key="tratamientos" />, 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-300'],
    ['Caja', <CashIcon key="caja" />, 'bg-sky-50 text-sky-500 dark:bg-sky-500/10 dark:text-sky-300'],
    ['Configuracion', <GearIcon key="configuracion" />, 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'],
  ] as const

  return (
    <section className="pt-3">
      <div className="grid min-h-[680px] overflow-hidden rounded-xl border border-white/80 bg-white/80 shadow-[0_14px_34px_-28px_rgba(39,39,42,.34)] backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80 lg:grid-cols-[54px_minmax(0,1fr)_240px]">
        <aside className="flex gap-1 border-b border-zinc-100 bg-white/70 p-2 dark:border-zinc-800 dark:bg-zinc-950/30 lg:flex-col lg:border-b-0 lg:border-r">
          <div className="mb-0 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[11px] font-bold text-amber-800 dark:text-[#D4AF37] lg:mb-2">
            GD
          </div>
          {nav.map(([label, icon, className]) => (
            <button
              key={label}
              title={label}
              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${className} [&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.7] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]`}
            >
              {icon}
            </button>
          ))}
        </aside>

        <section className="min-w-0 bg-[#F1EFF5]/75 p-2 dark:bg-zinc-950">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(116px,1fr))] gap-2">
            {adminKpis.map(([label, value]) => (
              <article
                key={label}
                className="min-w-0 rounded-xl border border-white/80 bg-white/90 p-2.5 shadow-[0_14px_34px_-28px_rgba(39,39,42,.34)] dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="truncate text-[10px] font-bold text-zinc-500">{label}</p>
                <p className="min-w-0 truncate text-lg font-bold tracking-tight md:text-xl">
                  {value}
                </p>
              </article>
            ))}
          </div>

          <section className="mt-2 overflow-hidden rounded-xl border border-white/80 bg-white/90 shadow-[0_14px_34px_-28px_rgba(39,39,42,.34)] dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
              <div className="min-w-0">
                <h1 className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  Agenda central
                </h1>
                <p className="truncate text-[10px] text-zinc-500">Hoy · boxes y profesionales</p>
              </div>
              <span className="rounded-full bg-[#D4AF37]/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-[#D4AF37]">
                3 turnos
              </span>
            </div>
            <div className="divide-y divide-zinc-100 p-2 dark:divide-zinc-800">
              {appointments.map(([time, title, professional, box, tone]) => (
                <article
                  key={time}
                  className="grid min-w-0 grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-2 py-2"
                >
                  <time className="text-[10px] font-bold tracking-wider text-zinc-400">
                    {time}
                  </time>
                  <div
                    className={`min-w-0 rounded-lg border px-2 py-1.5 ${
                      tone === 'sky'
                        ? 'border-sky-200 bg-sky-50/70 dark:border-sky-500/30 dark:bg-sky-500/10'
                        : tone === 'emerald'
                          ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/30 dark:bg-emerald-500/10'
                          : 'border-amber-200 bg-amber-50/70 dark:border-amber-500/30 dark:bg-amber-500/10'
                    }`}
                  >
                    <p className="truncate text-xs font-bold text-zinc-900 dark:text-zinc-50">
                      {title}
                    </p>
                    <p className="truncate text-[10px] text-zinc-500 dark:text-zinc-400">
                      {professional}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-zinc-700 dark:bg-zinc-950 dark:text-[#D4AF37]">
                    {box}
                  </span>
                </article>
              ))}
            </div>
          </section>
        </section>

        <aside className="border-t border-zinc-100 bg-white/70 p-3 dark:border-zinc-800 dark:bg-zinc-950/30 lg:border-l lg:border-t-0">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#D4AF37]">
            Ficha rapida
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500 text-[11px] font-bold text-white">
              VM
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">Valeria Mendez</p>
              <p className="truncate text-[10px] text-zinc-500">Paciente activa</p>
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50/70 p-2.5 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
            <p className="text-[10px] font-bold uppercase tracking-wider">Alerta medica</p>
            <p className="mt-1 text-xs">Alergias: Acido hialuronico</p>
          </div>
          <p className="mt-2 rounded-xl bg-white/80 p-2.5 text-xs leading-relaxed text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            Seguimiento post tratamiento en 15 dias. Prefiere horarios matutinos.
          </p>
          <button className="mt-3 w-full rounded-xl bg-[#D4AF37] px-3 py-2 text-xs font-bold text-zinc-950 shadow-[0_14px_34px_-28px_rgba(39,39,42,.34)] transition hover:brightness-105">
            Cobrar
          </button>
        </aside>
      </div>
    </section>
  )
}

function ClientView() {
  return (
    <section className="pt-3">
      <div className="mx-auto max-w-5xl rounded-2xl border border-white/80 bg-white/45 p-3 shadow-[0_14px_34px_-28px_rgba(39,39,42,.34)] backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/60">
        <header className="text-center">
          <p className="text-2xl font-bold uppercase tracking-[.22em] text-zinc-900 dark:text-zinc-50">
            Clinica Aura
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[.24em] text-[#D4AF37]">
            glowdesk.com.ar/clinica-aura
          </p>
        </header>
        <ol className="my-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <li className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-50">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D4AF37] text-[10px] text-white">
              1
            </span>
            Servicio
          </li>
          {['Profesional', 'Fecha', 'Listo'].map((label, index) => (
            <li key={label} className="contents">
              <span className="h-px w-8 bg-zinc-200 dark:bg-zinc-800" />
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-200 text-[10px]">
                  {index + 2}
                </span>
                {label}
              </span>
            </li>
          ))}
        </ol>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-2">
          {services.map(([name, price, duration]) => (
            <article
              key={name}
              className="group min-w-0 cursor-pointer rounded-xl border border-white/80 bg-white/70 p-3 shadow-[0_14px_34px_-28px_rgba(39,39,42,.34)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#D4AF37] dark:border-zinc-800 dark:bg-zinc-900/80"
            >
              <h3 className="truncate text-sm font-bold">{name}</h3>
              <div className="mt-5 flex items-end justify-between gap-2">
                <span className="min-w-0 truncate text-xs font-bold text-amber-700 dark:text-[#D4AF37]">
                  {price}
                </span>
                <span className="shrink-0 text-[10px] font-bold tracking-wider text-zinc-400">
                  {duration}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function DashboardPage() {
  const [activeView, setActiveView] = useState<ViewName>('superadmin')

  return (
    <section className="mx-auto max-w-7xl">
      <div className="sticky top-0 z-40 -mx-3 border-b border-zinc-200/70 bg-[#F5F5F3]/80 px-3 py-2 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/82">
        <nav
          className="flex w-fit min-w-0 flex-wrap gap-1 rounded-full border border-zinc-200/70 bg-white/65 p-1 shadow-[0_14px_34px_-28px_rgba(39,39,42,.34)] dark:border-zinc-800 dark:bg-zinc-900/70"
          aria-label="Selector de entorno"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveView(tab.id)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                activeView === tab.id
                  ? 'bg-[#D4AF37] text-white shadow-sm'
                  : 'text-zinc-500 hover:bg-[#D4AF37]/10 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeView === 'superadmin' && <SuperAdminView />}
      {activeView === 'admin' && <AdminTenantView />}
      {activeView === 'cliente' && <ClientView />}
    </section>
  )
}
