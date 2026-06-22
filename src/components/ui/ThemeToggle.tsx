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
      className="fixed right-4 top-4 z-50 inline-flex items-center gap-1 rounded-full border border-purple-100/80 bg-white/70 p-1 text-sm font-medium text-zinc-600 shadow-lg shadow-purple-100/50 backdrop-blur-md transition dark:border-amber-300/20 dark:bg-zinc-950/75 dark:text-zinc-300 dark:shadow-black/30"
      aria-label="Alternar modo dia y noche"
      aria-pressed={isDark}
    >
      <span
        className={`rounded-full px-3.5 py-1.5 transition ${
          !isDark
            ? 'bg-gradient-to-r from-violet-100 to-amber-100 text-amber-800 shadow-sm shadow-amber-100/80'
            : 'text-zinc-500 dark:text-zinc-500'
        }`}
      >
        Dia
      </span>
      <span
        className={`rounded-full px-3.5 py-1.5 transition ${
          isDark
            ? 'bg-gradient-to-r from-zinc-800 to-purple-950 text-[#E6C687] shadow-sm shadow-black/30'
            : 'text-zinc-500'
        }`}
      >
        Noche
      </span>
    </button>
  )
}
