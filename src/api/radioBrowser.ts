import type { Station } from '../types/station'

/** Зеркала публичного API: если одно не отвечает, пробуем следующее. */
export const API_SERVERS = [
  'https://de1.api.radio-browser.info',
  'https://de2.api.radio-browser.info',
  'https://fi1.api.radio-browser.info',
]

export const SEARCH_LIMIT = 40

/** Поля ответа /json/stations/search, которые нам нужны. */
export interface RawStation {
  stationuuid: string
  name: string
  url: string
  url_resolved: string
  homepage: string
  favicon: string
  tags: string
  country: string
  countrycode: string
  codec: string
  bitrate: number
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

const emptyToNull = (value: string | undefined): string | null => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export function toStation(raw: RawStation): Station | null {
  const streamUrl = emptyToNull(raw.url_resolved) ?? emptyToNull(raw.url)
  const name = raw.name?.trim().replace(/\s+/g, ' ')
  if (!raw.stationuuid || !streamUrl || !name) return null

  return {
    id: raw.stationuuid,
    name,
    streamUrl,
    homepage: emptyToNull(raw.homepage),
    favicon: emptyToNull(raw.favicon),
    country: raw.country?.trim() ?? '',
    countryCode: raw.countrycode?.trim() ?? '',
    tags: (raw.tags ?? '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    codec: raw.codec?.trim() ?? '',
    bitrate: Number.isFinite(raw.bitrate) ? raw.bitrate : 0,
  }
}

function normalizeStations(data: RawStation[]): Station[] {
  const seen = new Set<string>()
  const stations: Station[] = []
  for (const raw of data) {
    const station = toStation(raw)
    if (station && !seen.has(station.id)) {
      seen.add(station.id)
      stations.push(station)
    }
  }
  return stations
}

export async function searchStationsByName(
  name: string,
  signal?: AbortSignal,
): Promise<Station[]> {
  const params = new URLSearchParams({
    name: name.trim(),
    limit: String(SEARCH_LIMIT),
    hidebroken: 'true',
    order: 'clickcount',
    reverse: 'true',
  })

  let lastError: unknown = null
  for (const server of API_SERVERS) {
    try {
      const response = await fetch(`${server}/json/stations/search?${params}`, { signal })
      if (!response.ok) {
        throw new ApiError(`Radio Browser ответил ошибкой ${response.status}`)
      }
      const data: unknown = await response.json()
      if (!Array.isArray(data)) {
        throw new ApiError('Radio Browser вернул данные в неожиданном формате')
      }
      return normalizeStations(data as RawStation[])
    } catch (error) {
      // Отменённый запрос не повторяем на другом зеркале.
      if (signal?.aborted) throw error
      lastError = error
    }
  }
  throw lastError
}
