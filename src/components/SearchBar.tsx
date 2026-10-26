import type { Ref } from 'react'
import { SearchIcon } from './icons'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  inputRef?: Ref<HTMLInputElement>
}

export function SearchBar({ value, onChange, onSubmit, inputRef }: SearchBarProps) {
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
        ref={inputRef}
        id="station-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !value) event.currentTarget.blur()
        }}
        placeholder="Jazz, lofi, BBC, Radio Record…"
        autoComplete="off"
        spellCheck={false}
        className="peer glass w-full rounded-2xl py-4 pl-14 pr-4 text-base text-ink transition placeholder:text-ink-muted/70 focus:border-amber-glow/60 focus:shadow-glow focus-visible:outline-none sm:pr-14"
      />
      <kbd
        aria-hidden="true"
        className="pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/15 px-2 py-0.5 font-mono text-xs text-ink-muted peer-focus:opacity-0 sm:block"
      >
        /
      </kbd>
      <div className="tuner-scale pointer-events-none absolute inset-x-6 -bottom-3 h-2 opacity-40" aria-hidden="true" />
    </form>
  )
}
