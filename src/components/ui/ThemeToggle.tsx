import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('aurum-theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('aurum-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <button
      type="button"
      onClick={() => setIsDark((value) => !value)}
      className="fixed right-4 top-4 z-50 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 p-1 text-sm font-medium text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur transition dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:shadow-black/30"
      aria-label="Alternar modo dia y noche"
      aria-pressed={isDark}
    >
      <span
        className={`rounded-full px-3 py-1.5 transition ${
          !isDark ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        Dia
      </span>
      <span
        className={`rounded-full px-3 py-1.5 transition ${
          isDark ? 'bg-sky-400 text-slate-950 shadow-sm' : 'text-slate-500'
        }`}
      >
        Noche
      </span>
    </button>
  )
}
