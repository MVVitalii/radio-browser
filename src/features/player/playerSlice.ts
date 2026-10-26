import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Station } from '../../types/station'

export interface PlayerState {
  station: Station | null
  isPaused: boolean
  /** 0…1 */
  volume: number
  isMuted: boolean
}

const initialState: PlayerState = {
  station: null,
  isPaused: true,
  volume: 0.8,
  isMuted: false,
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
      state.isMuted = state.volume === 0
    },
    toggleMute(state) {
      state.isMuted = !state.isMuted
      // Включаем звук после громкости 0 — возвращаем слышимый уровень.
      if (!state.isMuted && state.volume === 0) state.volume = 0.5
    },
  },
  selectors: {
    selectCurrentStation: (state) => state.station,
    selectIsPaused: (state) => state.isPaused,
    selectVolume: (state) => state.volume,
    selectIsMuted: (state) => state.isMuted,
  },
})

export const { playStation, togglePause, setPaused, setVolume, toggleMute } = playerSlice.actions
export const { selectCurrentStation, selectIsPaused, selectVolume, selectIsMuted } =
  playerSlice.selectors
export default playerSlice.reducer
