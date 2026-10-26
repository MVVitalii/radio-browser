import type { Station } from '../../types/station'

export const FAVORITES_STORAGE_KEY = 'radio-browser:favorites'

function isStation(value: unknown): value is Station {
  if (typeof value !== 'object' || value === null) return false
  const station = value as Record<string, unknown>
  return (
    typeof station.id === 'string' &&
    typeof station.name === 'string' &&
    typeof station.streamUrl === 'string' &&
    Array.isArray(station.tags)
  )
}

/** Читает избранное; битые или чужие данные в localStorage просто отбрасываются. */
export function loadFavorites(): Station[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isStation) : []
  } catch {
    return []
  }
}

export function saveFavorites(stations: Station[]): void {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(stations))
  } catch {
    // Хранилище недоступно (приватный режим, переполнение) — избранное живёт до перезагрузки.
  }
}
