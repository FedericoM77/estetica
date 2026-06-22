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
    ? 'cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md hover:shadow-purple-100/50 dark:hover:border-amber-300/35 dark:hover:shadow-black/20'
    : ''
  const border = selected
    ? 'border-amber-300 shadow-[0_0_0_1px_rgba(217,119,6,0.22)] dark:border-[#E6C687]'
    : 'border-white/65 dark:border-zinc-800'

  return (
    <div
      className={`rounded-2xl border bg-white/80 p-5 shadow-sm shadow-purple-100/50 backdrop-blur-md dark:bg-zinc-900/82 dark:shadow-none ${interactive} ${border} ${className}`}
      {...props}
    />
  )
}
