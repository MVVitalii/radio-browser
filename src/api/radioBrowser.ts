import type { Station } from '../types/station'

/** Зеркала публичного API: если одно не отвечает, пробуем следующее. */
export const API_SERVERS = [
  'https://de1.api.radio-browser.info',
  'https://de2.api.radio-browser.info',
  'https://fi1.api.radio-browser.info',
]

export const SEARCH_LIMIT = 40
export const TAGS_LIMIT = 40

export type SortOrder = 'clickcount' | 'votes' | 'name' | 'bitrate'

export interface SearchParams {
  name: string
  countryCode: string
  tag: string
  order: SortOrder
  httpsOnly: boolean
}

export interface StationsPage {
  stations: Station[]
  /** Сервер вернул полную страницу — значит, может быть продолжение. */
  hasMore: boolean
}

export interface Country {
  code: string
  name: string
  stationCount: number
}

export interface Tag {
  name: string
  stationCount: number
}

/** Поля ответа /json/stations/*, которые нам нужны. */
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

interface RawCountry {
  name: string
  iso_3166_1: string
  stationcount: number
}

interface RawTag {
  name: string
  stationcount: number
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

/** GET к API с перебором зеркал. Ожидает в ответе JSON-массив. */
async function requestList(path: string, query: URLSearchParams, signal?: AbortSignal) {
  let lastError: unknown = null
  for (const server of API_SERVERS) {
    try {
      const response = await fetch(`${server}${path}?${query}`, { signal })
      if (!response.ok) {
        throw new ApiError(`Radio Browser ответил ошибкой ${response.status}`)
      }
      const data: unknown = await response.json()
      if (!Array.isArray(data)) {
        throw new ApiError('Radio Browser вернул данные в неожиданном формате')
      }
      return data as unknown[]
    } catch (error) {
      // Отменённый запрос не повторяем на другом зеркале.
      if (signal?.aborted) throw error
      lastError = error
    }
  }
  throw lastError
}

export async function fetchStations(
  params: SearchParams,
  offset = 0,
  signal?: AbortSignal,
  limit = SEARCH_LIMIT,
): Promise<StationsPage> {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    hidebroken: 'true',
    order: params.order,
    reverse: String(params.order !== 'name'),
  })
  const name = params.name.trim()
  if (name) query.set('name', name)
  if (params.countryCode) query.set('countrycode', params.countryCode)
  if (params.tag) {
    query.set('tag', params.tag)
    query.set('tagExact', 'true')
  }
  if (params.httpsOnly) query.set('is_https', 'true')

  const data = await requestList('/json/stations/search', query, signal)
  return {
    stations: normalizeStations(data as RawStation[]),
    hasMore: data.length === limit,
  }
}

export async function fetchCountries(signal?: AbortSignal): Promise<Country[]> {
  const query = new URLSearchParams({ order: 'stationcount', reverse: 'true', hidebroken: 'true' })
  const data = (await requestList('/json/countries', query, signal)) as RawCountry[]
  return data
    .filter((country) => /^[A-Z]{2}$/.test(country.iso_3166_1) && country.stationcount > 0)
    .map((country) => ({
      code: country.iso_3166_1,
      name: country.name,
      stationCount: country.stationcount,
    }))
}

export async function fetchTags(signal?: AbortSignal): Promise<Tag[]> {
  const query = new URLSearchParams({
    order: 'stationcount',
    reverse: 'true',
    hidebroken: 'true',
    limit: String(TAGS_LIMIT),
  })
  const data = (await requestList('/json/tags', query, signal)) as RawTag[]
  return data
    .filter((tag) => tag.name?.trim())
    .map((tag) => ({ name: tag.name.trim(), stationCount: tag.stationcount }))
}

/** Станция по stationuuid; null — такой станции нет (или она без потока). */
export async function fetchStationById(id: string, signal?: AbortSignal): Promise<Station | null> {
  const query = new URLSearchParams({ uuids: id })
  const data = (await requestList('/json/stations/byuuid', query, signal)) as RawStation[]
  return normalizeStations(data)[0] ?? null
}
