import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import type { Station } from '../../types/station'
import { countryName } from '../../utils/country'
import { selectFavorites, selectFavoritesSort, type FavoritesSort } from './favoritesSlice'

/** Set id избранного: проверка «в избранном ли станция» за O(1) для каждой карточки. */
export const selectFavoriteIds = createSelector(
  [selectFavorites],
  (items) => new Set(items.map((station) => station.id)),
)

export const selectIsFavorite = (state: RootState, id: string) => selectFavoriteIds(state).has(id)

const stationCountry = (station: Station) =>
  station.countryCode ? countryName(station.countryCode, station.country) : station.country

const comparators: Record<Exclude<FavoritesSort, 'added'>, (a: Station, b: Station) => number> = {
  name: (a, b) => a.name.localeCompare(b.name, 'ru'),
  country: (a, b) =>
    stationCountry(a).localeCompare(stationCountry(b), 'ru') || a.name.localeCompare(b.name, 'ru'),
}

/**
 * Избранное с фильтром по тексту и сортировкой.
 * Мемоизировано: пока не изменились станции, сортировка или текст фильтра,
 * возвращается тот же массив — список не перерисовывается.
 */
export const selectVisibleFavorites = createSelector(
  [selectFavorites, selectFavoritesSort, (_state: RootState, filter: string) => filter.trim().toLowerCase()],
  (items, sort, filter) => {
    const filtered = filter
      ? items.filter((station) =>
          [station.name, stationCountry(station), ...station.tags].some((value) =>
            value.toLowerCase().includes(filter),
          ),
        )
      : items
    return sort === 'added' ? filtered : [...filtered].sort(comparators[sort])
  },
)
