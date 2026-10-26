import { makeStore } from '../../app/store'
import { makeStation } from '../../test/utils'
import { removeFavorite, toggleFavorite } from './favoritesSlice'
import { FAVORITES_STORAGE_KEY, loadFavorites } from './favoritesStorage'

describe('favorites', () => {
  it('toggleFavorite добавляет и убирает станцию', () => {
    const store = makeStore()
    const station = makeStation()

    store.dispatch(toggleFavorite(station))
    expect(store.getState().favorites.items).toEqual([station])

    store.dispatch(toggleFavorite(station))
    expect(store.getState().favorites.items).toEqual([])
  })

  it('сохраняет изменения в localStorage', () => {
    const store = makeStore()
    store.dispatch(toggleFavorite(makeStation({ id: 'a' })))
    store.dispatch(toggleFavorite(makeStation({ id: 'b' })))
    store.dispatch(removeFavorite('a'))

    expect(loadFavorites().map((s) => s.id)).toEqual(['b'])
  })

  it('восстанавливает избранное при создании стора', () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([makeStation({ id: 'saved' })]))
    expect(makeStore().getState().favorites.items.map((s) => s.id)).toEqual(['saved'])
  })

  it('переживает битые данные в localStorage', () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, '{not json')
    expect(loadFavorites()).toEqual([])

    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([{ foo: 1 }, makeStation()]))
    expect(loadFavorites()).toHaveLength(1)
  })
})
