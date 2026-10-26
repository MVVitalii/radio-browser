import type { SelectHTMLAttributes } from 'react'
import { ChevronDownIcon } from './icons'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
}

/** Нативный select (доступность и мобильные пикеры из коробки) со своей стрелкой. */
export function Select({ label, className = '', children, ...props }: SelectProps) {
  return (
    <label className={`relative block min-w-0 ${className}`}>
      <span className="sr-only">{label}</span>
      <select
        {...props}
        className="glass peer w-full min-w-0 cursor-pointer appearance-none truncate rounded-xl py-2.5 pl-3 pr-9 text-sm text-ink transition hover:border-white/20 focus:border-amber-glow/60 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60 [&>option]:bg-night-900 [&>option]:text-ink"
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted transition peer-hover:text-ink peer-focus:text-amber-glow" />
    </label>
  )
}
