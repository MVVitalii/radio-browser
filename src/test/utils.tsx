import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { Provider } from 'react-redux'
import type { RawStation, SearchParams } from '../api/radioBrowser'
import { makeStore, type RootState } from '../app/store'
import type { Station } from '../types/station'

export function renderWithStore(ui: ReactElement, preloadedState?: Partial<RootState>) {
  const store = makeStore(preloadedState)
  return { store, ...render(<Provider store={store}>{ui}</Provider>) }
}

export function makeRawStation(overrides: Partial<RawStation> = {}): RawStation {
  return {
    stationuuid: 'uuid-1',
    name: 'Smooth Jazz',
    url: 'https://example.com/playlist.m3u',
    url_resolved: 'https://example.com/stream',
    homepage: 'https://example.com',
    favicon: 'https://example.com/favicon.png',
    tags: 'jazz,smooth jazz',
    country: 'Germany',
    countrycode: 'DE',
    codec: 'MP3',
    bitrate: 128,
    ...overrides,
  }
}

export function makeStation(overrides: Partial<Station> = {}): Station {
  return {
    id: 'uuid-1',
    name: 'Smooth Jazz',
    streamUrl: 'https://example.com/stream',
    homepage: 'https://example.com',
    favicon: null,
    country: 'Germany',
    countryCode: 'DE',
    tags: ['jazz'],
    codec: 'MP3',
    bitrate: 128,
    ...overrides,
  }
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function makeParams(overrides: Partial<SearchParams> = {}): SearchParams {
  return { name: 'jazz', countryCode: '', tag: '', order: 'clickcount', httpsOnly: false, ...overrides }
}

/** Обработчик маршрута: возвращает тело ответа (или готовый Response) либо бросает сетевую ошибку. */
type RouteHandler = (url: URL) => unknown

interface RadioApiMock {
  search?: RouteHandler
  byUuid?: RouteHandler
  countries?: unknown[]
  tags?: unknown[]
}

/** Подменяет fetch и раскладывает запросы к Radio Browser по маршрутам. */
export function mockRadioApi({ search, byUuid, countries = [], tags = [] }: RadioApiMock = {}) {
  const handle = async (handler: RouteHandler | undefined, url: URL) => {
    const body = handler ? await handler(url) : []
    return body instanceof Response ? body : jsonResponse(body)
  }

  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input))
    if (url.pathname.startsWith('/json/stations/search')) return handle(search, url)
    if (url.pathname.startsWith('/json/stations/byuuid')) return handle(byUuid, url)
    if (url.pathname.startsWith('/json/countries')) return jsonResponse(countries)
    if (url.pathname.startsWith('/json/tags')) return jsonResponse(tags)
    return jsonResponse({ error: 'not found' }, 404)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
