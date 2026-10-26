import { makeStore } from '../../app/store'
import { makeStation } from '../../test/utils'
import { selectFavoriteIds, selectIsFavorite, selectVisibleFavorites } from './favoritesSelectors'
import { setFavoritesSort, toggleFavorite } from './favoritesSlice'

function storeWithFavorites() {
  const store = makeStore()
  store.dispatch(toggleFavorite(makeStation({ id: 'b', name: 'Berlin Jazz', countryCode: 'DE', tags: ['jazz'] })))
  store.dispatch(toggleFavorite(makeStation({ id: 'a', name: 'Austin Rock', countryCode: 'US', tags: ['rock'] })))
  store.dispatch(toggleFavorite(makeStation({ id: 'c', name: 'Cafe Lounge', countryCode: 'FR', tags: ['chill'] })))
  return store
}

const ids = (stations: { id: string }[]) => stations.map((station) => station.id)

describe('favorites selectors', () => {
  it('по умолчанию — порядок добавления, новые сверху', () => {
    const state = storeWithFavorites().getState()
    expect(ids(selectVisibleFavorites(state, ''))).toEqual(['c', 'a', 'b'])
  })

  it('сортирует по названию и по стране', () => {
    const store = storeWithFavorites()
    store.dispatch(setFavoritesSort('name'))
    expect(ids(selectVisibleFavorites(store.getState(), ''))).toEqual(['a', 'b', 'c'])

    store.dispatch(setFavoritesSort('country'))
    // Германия, США, Франция — по-русски
    expect(ids(selectVisibleFavorites(store.getState(), ''))).toEqual(['b', 'a', 'c'])
  })

  it('фильтрует по названию, стране и жанру без учёта регистра', () => {
    const state = storeWithFavorites().getState()
    expect(ids(selectVisibleFavorites(state, 'ROCK'))).toEqual(['a'])
    expect(ids(selectVisibleFavorites(state, 'франц'))).toEqual(['c'])
    expect(ids(selectVisibleFavorites(state, ' berlin '))).toEqual(['b'])
  })

  it('мемоизирован: те же входные данные — тот же массив', () => {
    const store = storeWithFavorites()
    store.dispatch(setFavoritesSort('name'))
    const state = store.getState()

    expect(selectVisibleFavorites(state, 'a')).toBe(selectVisibleFavorites(state, 'a'))
    expect(selectFavoriteIds(state)).toBe(selectFavoriteIds(store.getState()))
  })

  it('selectIsFavorite', () => {
    const state = storeWithFavorites().getState()
    expect(selectIsFavorite(state, 'a')).toBe(true)
    expect(selectIsFavorite(state, 'zzz')).toBe(false)
  })
})
