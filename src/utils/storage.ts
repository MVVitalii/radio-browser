import type { Station } from '../types/station'

/** Читает JSON из localStorage; недоступное хранилище или битые данные дают null. */
export function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as unknown) : null
  } catch {
    return null
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Хранилище недоступно (приватный режим, переполнение) — данные живут до перезагрузки.
  }
}

export function isStation(value: unknown): value is Station {
  if (typeof value !== 'object' || value === null) return false
  const station = value as Record<string, unknown>
  return (
    typeof station.id === 'string' &&
    typeof station.name === 'string' &&
    typeof station.streamUrl === 'string' &&
    Array.isArray(station.tags)
  )
}

/** Список станций из localStorage; чужие или повреждённые записи отбрасываются. */
export function readStations(key: string): Station[] {
  const data = readJson(key)
  return Array.isArray(data) ? data.filter(isStation) : []
}
