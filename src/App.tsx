function App() {
  return (
    <div className="relative z-10 mx-auto min-h-screen max-w-6xl px-4 pb-32 pt-8 sm:px-6">
      <header className="animate-rise">
        <div className="flex items-center gap-3">
          <span className="eq" aria-hidden="true">
            <i></i>
            <i></i>
            <i></i>
            <i></i>
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-amber-glow animate-on-air">
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
        <div className="tuner-scale relative mt-6 h-6 rounded-full opacity-60" aria-hidden="true">
          <span className="absolute inset-y-0 left-1/3 w-0.5 rounded-full bg-amber-glow shadow-glow" />
        </div>
      </header>
    </div>
  )
}

export default App
