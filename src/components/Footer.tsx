const HOTKEYS = [
  ['Пробел', 'пауза'],
  ['M', 'звук'],
  ['/', 'поиск'],
] as const

export function Footer() {
  return (
    <footer className="mt-16 flex flex-col items-center gap-3 text-center font-mono text-[11px] text-ink-muted">
      <p className="hidden items-center gap-4 sm:flex">
        {HOTKEYS.map(([key, action]) => (
          <span key={key} className="flex items-center gap-1.5">
            <kbd className="rounded-md border border-white/15 px-1.5 py-0.5">{key}</kbd>
            {action}
          </span>
        ))}
      </p>
      <p>
        Данные:{' '}
        <a
          href="https://www.radio-browser.info/"
          target="_blank"
          rel="noreferrer"
          className="underline-offset-4 hover:text-amber-glow hover:underline"
        >
          radio-browser.info
        </a>
      </p>
    </footer>
  )
}
