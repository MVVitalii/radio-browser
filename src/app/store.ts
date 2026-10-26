import {
  combineReducers,
  configureStore,
  createListenerMiddleware,
  isAnyOf,
} from '@reduxjs/toolkit'
import favoritesReducer, {
  removeFavorite,
  toggleFavorite,
} from '../features/favorites/favoritesSlice'
import { saveFavorites } from '../features/favorites/favoritesStorage'
import playerReducer from '../features/player/playerSlice'
import stationsReducer from '../features/stations/stationsSlice'

const rootReducer = combineReducers({
  player: playerReducer,
  stations: stationsReducer,
  favorites: favoritesReducer,
})

export type RootState = ReturnType<typeof rootReducer>

/** Сохраняем избранное в localStorage после каждого его изменения. */
const favoritesPersistence = createListenerMiddleware()
favoritesPersistence.startListening({
  matcher: isAnyOf(toggleFavorite, removeFavorite),
  effect: (_action, api) => {
    saveFavorites((api.getState() as RootState).favorites.items)
  },
})

export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(favoritesPersistence.middleware),
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type AppDispatch = AppStore['dispatch']
