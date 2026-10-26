import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Station } from '../../types/station'
import { isStation, readJson, writeJson } from '../../utils/storage'

export interface PlayerState {
  station: Station | null
  isPaused: boolean
  /** 0…1 */
  volume: number
  isMuted: boolean
}

export const PLAYER_STORAGE_KEY = 'radio-browser:player'

const DEFAULT_VOLUME = 0.8

const clamp = (value: number) => Math.min(1, Math.max(0, value))

/** Что переживает перезагрузку: последняя станция и настройки звука. */
type SavedPlayer = Pick<PlayerState, 'station' | 'volume' | 'isMuted'>

export const savePlayer = ({ station, volume, isMuted }: PlayerState) =>
  writeJson(PLAYER_STORAGE_KEY, { station, volume, isMuted } satisfies SavedPlayer)

function loadPlayer(): PlayerState {
  const saved = readJson(PLAYER_STORAGE_KEY) as Partial<Record<keyof SavedPlayer, unknown>> | null
  return {
    station: isStation(saved?.station) ? saved.station : null,
    // Автозапуск без жеста пользователя браузер всё равно запретит — стартуем на паузе.
    isPaused: true,
    volume: typeof saved?.volume === 'number' ? clamp(saved.volume) : DEFAULT_VOLUME,
    isMuted: saved?.isMuted === true,
  }
}

const playerSlice = createSlice({
  name: 'player',
  initialState: loadPlayer,
  reducers: {
    playStation(state, action: PayloadAction<Station>) {
      state.station = action.payload
      state.isPaused = false
    },
    /** Выбрать станцию, но не запускать (например, открыта по ссылке). */
    cueStation(state, action: PayloadAction<Station>) {
      state.station = action.payload
      state.isPaused = true
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

export const { playStation, cueStation, togglePause, setPaused, setVolume, toggleMute } =
  playerSlice.actions
export const { selectCurrentStation, selectIsPaused, selectVolume, selectIsMuted } =
  playerSlice.selectors
export default playerSlice.reducer
