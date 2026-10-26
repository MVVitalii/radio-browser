import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Station } from '../../types/station'
import { loadFavorites } from './favoritesStorage'

export interface FavoritesState {
  items: Station[]
}

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: (): FavoritesState => ({ items: loadFavorites() }),
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
  },
  selectors: {
    selectFavorites: (state) => state.items,
    selectFavoritesCount: (state) => state.items.length,
    selectIsFavorite: (state, id: string) => state.items.some((station) => station.id === id),
  },
})

export const { toggleFavorite, removeFavorite } = favoritesSlice.actions
export const { selectFavorites, selectFavoritesCount, selectIsFavorite } = favoritesSlice.selectors
export default favoritesSlice.reducer
