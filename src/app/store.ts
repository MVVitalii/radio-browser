import { combineReducers, configureStore } from '@reduxjs/toolkit'
import favoritesReducer from '../features/favorites/favoritesSlice'
import playerReducer from '../features/player/playerSlice'
import recentReducer from '../features/recent/recentSlice'
import stationsReducer from '../features/stations/stationsSlice'
import { persistence } from './persistence'

const rootReducer = combineReducers({
  player: playerReducer,
  stations: stationsReducer,
  favorites: favoritesReducer,
  recent: recentReducer,
})

export type RootState = ReturnType<typeof rootReducer>

export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(persistence.middleware),
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type AppDispatch = AppStore['dispatch']
