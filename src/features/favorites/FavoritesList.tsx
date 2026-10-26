import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { EmptyState } from '../../components/EmptyState'
import { HeartIcon } from '../../components/icons'
import { Select } from '../../components/Select'
import { StationGrid } from '../../components/StationGrid'
import { selectVisibleFavorites } from './favoritesSelectors'
import {
  selectFavoritesCount,
  selectFavoritesSort,
  setFavoritesSort,
  type FavoritesSort,
} from './favoritesSlice'

const SORT_OPTIONS: { value: FavoritesSort; label: string }[] = [
  { value: 'added', label: 'Сначала новые' },
  { value: 'name', label: 'По названию' },
  { value: 'country', label: 'По стране' },
]

export function FavoritesList() {
  const dispatch = useAppDispatch()
  const [filter, setFilter] = useState('')
  const total = useAppSelector(selectFavoritesCount)
  const sort = useAppSelector(selectFavoritesSort)
  const visible = useAppSelector((state) => selectVisibleFavorites(state, filter))

  if (total === 0) {
    return (
      <EmptyState icon={<HeartIcon className="size-9" />} title="Пока пусто">
        <p>Нажмите на сердечко у станции — она появится здесь и сохранится между визитами.</p>
      </EmptyState>
    )
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="flex-1">
          <span className="sr-only">Фильтр по избранному</span>
          <input
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Название, страна или жанр"
            className="glass w-full rounded-xl px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 focus:border-amber-glow/60 focus-visible:outline-none"
          />
        </label>
        <Select
          label="Сортировка избранного"
          value={sort}
          onChange={(event) => dispatch(setFavoritesSort(event.target.value as FavoritesSort))}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <p aria-live="polite" className="mb-4 font-mono text-xs text-ink-muted">
        {filter.trim() ? `${visible.length} из ${total}` : `${total} в избранном`}
      </p>

      {visible.length > 0 ? (
        <StationGrid stations={visible} />
      ) : (
        <EmptyState icon={<HeartIcon className="size-9" />} title="Ничего не нашлось">
          <p>Среди избранного нет станций по запросу «{filter.trim()}».</p>
        </EmptyState>
      )}
    </div>
  )
}
