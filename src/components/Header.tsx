import { Equalizer } from './Equalizer'

export function Header() {
  return (
    <header className="animate-rise">
      <div className="flex items-center gap-3">
        <Equalizer />
        <span className="animate-on-air font-mono text-xs uppercase tracking-[0.3em] text-amber-glow">
          On air
        </span>
      </div>
      <h1 className="mt-4 font-display text-4xl font-extrabold leading-none tracking-tight sm:text-6xl">
        Radio{' '}
        <span className="bg-linear-to-r from-amber-glow to-amber-deep bg-clip-text text-transparent">
          Browser
        </span>
      </h1>
      <p className="mt-3 max-w-md text-ink-muted">
        Тысячи станций со всего мира. Найди свою волну.
      </p>
    </header>
  )
}
