import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  children?: ReactNode
  tone?: 'amber' | 'signal'
}

export function EmptyState({ icon, title, children, tone = 'amber' }: EmptyStateProps) {
  const toneClass =
    tone === 'amber' ? 'text-amber-glow shadow-glow' : 'text-signal shadow-glow-signal'

  return (
    <div className="animate-rise flex flex-col items-center px-4 py-16 text-center">
      <div className={`glass grid size-20 place-items-center rounded-full ${toneClass}`}>
        {icon}
      </div>
      <h2 className="mt-6 font-display text-xl font-bold sm:text-2xl">{title}</h2>
      <div className="mt-2 max-w-sm text-sm text-ink-muted">{children}</div>
    </div>
  )
}
