import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  selectable?: boolean
  selected?: boolean
}

export function Card({
  selectable = false,
  selected = false,
  className = '',
  ...props
}: CardProps) {
  const interactive = selectable
    ? 'cursor-pointer transition-all duration-150 hover:-translate-y-0.5'
    : ''
  const border = selected
    ? 'border-gold shadow-[0_0_0_1px_#C9A96E]'
    : 'border-line'

  return (
    <div
      className={`rounded-card border bg-surface p-5 shadow-soft ${interactive} ${border} ${className}`}
      {...props}
    />
  )
}
