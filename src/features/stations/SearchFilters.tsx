import { useEffect, useMemo } from 'react'
import type { SortOrder } from '../../api/radioBrowser'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { Select } from '../../components/Select'
import { countryName } from '../../utils/country'
import {
  defaultFilters,
  fetchFilterOptions,
  resetFilters,
  selectFilterOptions,
  selectFilters,
  setFilters,
} from './stationsSlice'

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'clickcount', label: 'Популярные' },
  { value: 'votes', label: 'По рейтингу' },
  { value: 'bitrate', label: 'Лучшее качество' },
  { value: 'name', label: 'По названию' },
]

export function SearchFilters() {
  const dispatch = useAppDispatch()
  const filters = useAppSelector(selectFilters)
  const options = useAppSelector(selectFilterOptions)
  const isLoadingOptions = options.status === 'loading'

  useEffect(() => {
    dispatch(fetchFilterOptions())
  }, [dispatch])

  const countries = useMemo(
    () =>
      options.countries
        .map((country) => ({ code: country.code, name: countryName(country.code, country.name) }))
        .sort((a, b) => a.name.localeCompare(b.name, 'ru')),
    [options.countries],
  )

  // Жанр мог прийти не из списка (клик по тегу на карточке) — показываем и его.
  const tags = useMemo(() => {
    const names = options.tags.map((tag) => tag.name)
    return filters.tag && !names.includes(filters.tag) ? [filters.tag, ...names] : names
  }, [options.tags, filters.tag])

  const defaults = defaultFilters()
  const isDirty =
    filters.countryCode !== defaults.countryCode ||
    filters.tag !== defaults.tag ||
    filters.order !== defaults.order ||
    filters.httpsOnly !== defaults.httpsOnly

  return (
    <div className="mt-6 grid grid-cols-2 items-center gap-2 sm:flex sm:flex-wrap">
      <Select
        label="Страна"
        value={filters.countryCode}
        disabled={isLoadingOptions}
        onChange={(event) => dispatch(setFilters({ countryCode: event.target.value }))}
      >
        <option value="">Все страны</option>
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </Select>

      <Select
        label="Жанр"
        value={filters.tag}
        disabled={isLoadingOptions}
        onChange={(event) => dispatch(setFilters({ tag: event.target.value }))}
      >
        <option value="">Все жанры</option>
        {tags.map((tag) => (
          <option key={tag} value={tag}>
            #{tag}
          </option>
        ))}
      </Select>

      <Select
        label="Сортировка"
        value={filters.order}
        onChange={(event) => dispatch(setFilters({ order: event.target.value as SortOrder }))}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <label className="glass flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-ink transition hover:border-white/20">
        <input
          type="checkbox"
          checked={filters.httpsOnly}
          onChange={(event) => dispatch(setFilters({ httpsOnly: event.target.checked }))}
          className="size-4 accent-amber-glow"
        />
        Только HTTPS
      </label>

      {isDirty && (
        <button
          type="button"
          onClick={() => dispatch(resetFilters())}
          className="col-span-2 rounded-xl px-3 py-2.5 text-sm text-ink-muted underline-offset-4 transition hover:text-amber-glow hover:underline sm:col-span-1"
        >
          Сбросить фильтры
        </button>
      )}
    </div>
  )
}
