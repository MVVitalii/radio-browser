import { createSlice } from '@reduxjs/toolkit'
import type { Station } from '../../types/station'
import { readStations, writeJson } from '../../utils/storage'
import { playStation } from '../player/playerSlice'

export const RECENT_STORAGE_KEY = 'radio-browser:recent'
export const RECENT_LIMIT = 10

export interface RecentState {
  items: Station[]
}

export const saveRecent = (stations: Station[]) => writeJson(RECENT_STORAGE_KEY, stations)

const recentSlice = createSlice({
  name: 'recent',
  initialState: (): RecentState => ({
    items: readStations(RECENT_STORAGE_KEY).slice(0, RECENT_LIMIT),
  }),
  reducers: {
    clearRecent(state) {
      state.items = []
    },
  },
  // Слайс сам реагирует на чужой экшен: плееру не нужно знать об истории.
  extraReducers: (builder) => {
    builder.addCase(playStation, (state, action) => {
      const rest = state.items.filter((station) => station.id !== action.payload.id)
      state.items = [action.payload, ...rest].slice(0, RECENT_LIMIT)
    })
  },
  selectors: {
    selectRecent: (state) => state.items,
  },
})

export const { clearRecent } = recentSlice.actions
export const { selectRecent } = recentSlice.selectors
export default recentSlice.reducer
