import { Outlet } from 'react-router-dom'

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#F5F5F3] font-sans text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(221,214,254,.36),transparent_34%),linear-gradient(135deg,#F5F5F3_0%,#F1EFF5_48%,#F4F1EA_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(88,28,135,.2),transparent_32%),linear-gradient(135deg,#09090B_0%,#18111F_52%,#09090B_100%)]" />
      <main className="min-h-screen px-3 py-3 pr-16">
        <Outlet />
      </main>
    </div>
  )
}
