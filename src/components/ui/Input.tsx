import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react'

const fieldClasses =
  'w-full rounded-input border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted outline-none transition-colors duration-150 focus:border-gold'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string | null
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-muted">{label}</span>
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
      <span className="mb-1.5 block text-muted">{label}</span>
      <select className={`${fieldClasses} ${className}`} {...props}>
        {children}
      </select>
    </label>
  )
}
