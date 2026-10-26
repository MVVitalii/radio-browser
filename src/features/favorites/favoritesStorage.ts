import type { Station } from '../../types/station'
import { readStations, writeJson } from '../../utils/storage'

export const FAVORITES_STORAGE_KEY = 'radio-browser:favorites'

export const loadFavorites = (): Station[] => readStations(FAVORITES_STORAGE_KEY)

export const saveFavorites = (stations: Station[]) => writeJson(FAVORITES_STORAGE_KEY, stations)
