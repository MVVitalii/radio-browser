import { SearchIcon } from './icons'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
}

export function SearchBar({ value, onChange, onSubmit }: SearchBarProps) {
  return (
    <form
      role="search"
      className="relative mt-8"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <label htmlFor="station-search" className="sr-only">
        Поиск станции по названию
      </label>
      <SearchIcon className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-ink-muted" />
      <input
        id="station-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Jazz, lofi, BBC, Radio Record…"
        autoComplete="off"
        spellCheck={false}
        className="glass w-full rounded-2xl py-4 pl-14 pr-4 text-base text-ink transition placeholder:text-ink-muted/70 focus:border-amber-glow/60 focus:shadow-glow focus-visible:outline-none"
      />
      <div className="tuner-scale pointer-events-none absolute inset-x-6 -bottom-3 h-2 opacity-40" aria-hidden="true" />
    </form>
  )
}
