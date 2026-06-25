import { useEffect, useState } from 'react'

const LEGACY_THEME_KEY = ['aurum', 'theme'].join('-')

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(
    () =>
      localStorage.getItem('glowdesk-theme') === 'dark' ||
      localStorage.getItem(LEGACY_THEME_KEY) === 'dark',
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('glowdesk-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <button
      type="button"
      onClick={() => setIsDark((value) => !value)}
      className="fixed right-4 top-4 z-50 inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/80 bg-white/75 text-zinc-600 shadow-[0_14px_34px_-28px_rgba(39,39,42,.34)] backdrop-blur-md transition hover:border-[#D4AF37] dark:border-zinc-800 dark:bg-zinc-900/85 dark:text-[#D4AF37]"
      aria-label="Alternar modo dia y noche"
      aria-pressed={isDark}
    >
      {isDark ? (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 14.6A8.5 8.5 0 0 1 9.4 3a7 7 0 1 0 11.6 11.6Z" />
        </svg>
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      )}
    </button>
  )
}
