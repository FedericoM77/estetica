import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-btn px-5 py-2.5 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40'

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-gradient-to-r from-amber-200 to-violet-200 text-zinc-900 shadow-sm shadow-amber-200/40 hover:from-amber-300 hover:to-violet-300 dark:from-zinc-800 dark:to-purple-950 dark:text-[#E6C687] dark:shadow-black/30 dark:hover:from-zinc-700 dark:hover:to-purple-900',
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
