import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { Provider } from 'react-redux'
import type { RawStation } from '../api/radioBrowser'
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
