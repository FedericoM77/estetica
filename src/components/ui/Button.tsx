import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-btn px-5 py-2.5 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40'

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-gold text-base hover:bg-gold-light',
  secondary: 'border border-line bg-transparent text-ink hover:border-muted',
  danger: 'border border-error/50 bg-transparent text-error hover:bg-error/10',
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
