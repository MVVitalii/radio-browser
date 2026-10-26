import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import {
  removeFavorite,
  toggleFavorite,
} from '../features/favorites/favoritesSlice'
import { saveFavorites } from '../features/favorites/favoritesStorage'
import { playStation } from '../features/player/playerSlice'
import { clearRecent, saveRecent } from '../features/recent/recentSlice'
import type { RootState } from './store'

/** Сохраняет в localStorage то, что должно пережить перезагрузку. Слайсы при этом остаются чистыми. */
export const persistence = createListenerMiddleware()

persistence.startListening({
  matcher: isAnyOf(toggleFavorite, removeFavorite),
  effect: (_action, api) => {
    saveFavorites((api.getState() as RootState).favorites.items)
  },
})

persistence.startListening({
  matcher: isAnyOf(playStation, clearRecent),
  effect: (_action, api) => {
    saveRecent((api.getState() as RootState).recent.items)
  },
})
