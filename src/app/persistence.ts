import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { removeFavorite, toggleFavorite } from '../features/favorites/favoritesSlice'
import { saveFavorites } from '../features/favorites/favoritesStorage'
import {
  cueStation,
  playStation,
  savePlayer,
  setVolume,
  toggleMute,
} from '../features/player/playerSlice'
import { clearRecent, saveRecent } from '../features/recent/recentSlice'
import { setStationInUrl } from '../utils/shareLink'
import type { RootState } from './store'

export const PLAYER_SAVE_DELAY_MS = 300

/**
 * Побочные эффекты в одном месте: localStorage и адресная строка.
 * Слайсы при этом остаются чистыми функциями.
 */
export const persistence = createListenerMiddleware()

const getState = (api: { getState: () => unknown }) => api.getState() as RootState

/** Регистрирует слушателей. Отдельная функция — чтобы тесты могли сбросить их между прогонами. */
export function startPersistence() {
  persistence.startListening({
    matcher: isAnyOf(toggleFavorite, removeFavorite),
    effect: (_action, api) => saveFavorites(getState(api).favorites.items),
  })

  persistence.startListening({
    matcher: isAnyOf(playStation, clearRecent),
    effect: (_action, api) => saveRecent(getState(api).recent.items),
  })

  persistence.startListening({
    matcher: isAnyOf(playStation, cueStation, setVolume, toggleMute),
    effect: async (_action, api) => {
      // Ползунок громкости шлёт десятки экшенов в секунду — пишем только последний.
      api.cancelActiveListeners()
      await api.delay(PLAYER_SAVE_DELAY_MS)
      savePlayer(getState(api).player)
    },
  })

  persistence.startListening({
    matcher: isAnyOf(playStation, cueStation),
    effect: (_action, api) => setStationInUrl(getState(api).player.station?.id ?? null),
  })
}

startPersistence()
