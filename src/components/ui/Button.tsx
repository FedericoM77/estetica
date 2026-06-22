import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-btn px-5 py-2.5 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40'

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-sm shadow-violet-500/20 hover:from-purple-600 hover:to-violet-700 dark:bg-sky-400 dark:bg-none dark:text-slate-950 dark:hover:bg-sky-300',
  secondary:
    'border border-slate-200 bg-transparent text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800',
  danger:
    'border border-rose-500/50 bg-transparent text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-400/10',
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
