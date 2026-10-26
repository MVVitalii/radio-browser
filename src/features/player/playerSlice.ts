import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Station } from '../../types/station'

export interface PlayerState {
  station: Station | null
  isPaused: boolean
  /** 0…1 */
  volume: number
}

const initialState: PlayerState = {
  station: null,
  isPaused: true,
  volume: 0.8,
}

const clamp = (value: number) => Math.min(1, Math.max(0, value))

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    playStation(state, action: PayloadAction<Station>) {
      state.station = action.payload
      state.isPaused = false
    },
    togglePause(state) {
      if (state.station) state.isPaused = !state.isPaused
    },
    setPaused(state, action: PayloadAction<boolean>) {
      state.isPaused = action.payload
    },
    setVolume(state, action: PayloadAction<number>) {
      state.volume = clamp(action.payload)
    },
  },
  selectors: {
    selectCurrentStation: (state) => state.station,
    selectIsPaused: (state) => state.isPaused,
    selectVolume: (state) => state.volume,
  },
})

export const { playStation, togglePause, setPaused, setVolume } = playerSlice.actions
export const { selectCurrentStation, selectIsPaused, selectVolume } = playerSlice.selectors
export default playerSlice.reducer
