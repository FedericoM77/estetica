import type { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

export function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(233,213,255,0.42),transparent_34%),linear-gradient(135deg,#f5f5f3_0%,#f1eff5_48%,#f4f1ea_100%)] text-ink transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,rgba(88,28,135,0.28),transparent_34%),linear-gradient(135deg,#0f0f0f_0%,#18111f_45%,#0f0f0f_100%)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white/25 to-transparent dark:from-white/5" />
      <Header />
      <main className="relative mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      <Footer />
    </div>
  )
}
