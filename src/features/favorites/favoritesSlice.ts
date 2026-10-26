import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Station } from '../../types/station'
import { loadFavorites } from './favoritesStorage'

export type FavoritesSort = 'added' | 'name' | 'country'

export interface FavoritesState {
  items: Station[]
  sort: FavoritesSort
}

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: (): FavoritesState => ({ items: loadFavorites(), sort: 'added' }),
  reducers: {
    toggleFavorite(state, action: PayloadAction<Station>) {
      const index = state.items.findIndex((station) => station.id === action.payload.id)
      if (index >= 0) {
        state.items.splice(index, 1)
      } else {
        state.items.unshift(action.payload)
      }
    },
    removeFavorite(state, action: PayloadAction<string>) {
      state.items = state.items.filter((station) => station.id !== action.payload)
    },
    setFavoritesSort(state, action: PayloadAction<FavoritesSort>) {
      state.sort = action.payload
    },
  },
  selectors: {
    selectFavorites: (state) => state.items,
    selectFavoritesCount: (state) => state.items.length,
    selectFavoritesSort: (state) => state.sort,
  },
})

export const { toggleFavorite, removeFavorite, setFavoritesSort } = favoritesSlice.actions
export const { selectFavorites, selectFavoritesCount, selectFavoritesSort } =
  favoritesSlice.selectors
export default favoritesSlice.reducer
