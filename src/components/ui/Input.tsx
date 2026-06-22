import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react'

const fieldClasses =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition-colors duration-150 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-300'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string | null
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-slate-500 dark:text-slate-400">{label}</span>
      <input id={id} className={`${fieldClasses} ${className}`} {...props} />
      {error && <span className="mt-1 block text-xs text-error">{error}</span>}
    </label>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
}

export function Select({ label, className = '', children, ...props }: SelectProps) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-slate-500 dark:text-slate-400">{label}</span>
      <select className={`${fieldClasses} ${className}`} {...props}>
        {children}
      </select>
    </label>
  )
}
