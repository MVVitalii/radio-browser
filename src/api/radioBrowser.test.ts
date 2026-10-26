import { jsonResponse, makeParams, makeRawStation } from '../test/utils'
import {
  API_SERVERS,
  ApiError,
  fetchCountries,
  fetchStations,
  SEARCH_LIMIT,
  toStation,
} from './radioBrowser'

const requestedUrl = (fetchMock: ReturnType<typeof vi.fn>, call = 0) =>
  new URL(fetchMock.mock.calls[call][0] as string)

describe('toStation', () => {
  it('нормализует поля ответа', () => {
    const station = toStation(
      makeRawStation({ name: '  Smooth   Jazz ', favicon: '', tags: 'jazz, ,smooth jazz ' }),
    )
    expect(station).toMatchObject({
      id: 'uuid-1',
      name: 'Smooth Jazz',
      streamUrl: 'https://example.com/stream',
      favicon: null,
      tags: ['jazz', 'smooth jazz'],
    })
  })

  it('берёт url, если url_resolved пуст', () => {
    expect(toStation(makeRawStation({ url_resolved: '' }))?.streamUrl).toBe(
      'https://example.com/playlist.m3u',
    )
  })

  it('отбрасывает станцию без потока или названия', () => {
    expect(toStation(makeRawStation({ url: '', url_resolved: '' }))).toBeNull()
    expect(toStation(makeRawStation({ name: '   ' }))).toBeNull()
  })
})

describe('fetchStations', () => {
  it('отправляет базовые параметры и убирает дубликаты', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse([makeRawStation(), makeRawStation(), makeRawStation({ stationuuid: 'uuid-2' })]),
      )
    vi.stubGlobal('fetch', fetchMock)

    const page = await fetchStations(makeParams({ name: ' jazz fm ' }))

    expect(page.stations.map((s) => s.id)).toEqual(['uuid-1', 'uuid-2'])
    expect(page.hasMore).toBe(false)
    const url = requestedUrl(fetchMock)
    expect(url.origin).toBe(API_SERVERS[0])
    expect(url.pathname).toBe('/json/stations/search')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      name: 'jazz fm',
      limit: String(SEARCH_LIMIT),
      offset: '0',
      hidebroken: 'true',
      order: 'clickcount',
      reverse: 'true',
    })
  })

  it('добавляет фильтры и смещение', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]))
    vi.stubGlobal('fetch', fetchMock)

    await fetchStations(
      makeParams({ name: '', countryCode: 'DE', tag: 'jazz', order: 'name', httpsOnly: true }),
      80,
    )

    const params = requestedUrl(fetchMock).searchParams
    expect(params.has('name')).toBe(false)
    expect(params.get('countrycode')).toBe('DE')
    expect(params.get('tag')).toBe('jazz')
    expect(params.get('tagExact')).toBe('true')
    expect(params.get('is_https')).toBe('true')
    expect(params.get('reverse')).toBe('false')
    expect(params.get('offset')).toBe('80')
  })

  it('hasMore, если пришла полная страница', async () => {
    const full = Array.from({ length: SEARCH_LIMIT }, (_, i) =>
      makeRawStation({ stationuuid: `id-${i}` }),
    )
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(full)))
    expect((await fetchStations(makeParams())).hasMore).toBe(true)
  })

  it('переключается на следующее зеркало при сетевой ошибке', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(jsonResponse([makeRawStation()]))
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchStations(makeParams())).resolves.toMatchObject({ stations: [{ id: 'uuid-1' }] })
    expect(requestedUrl(fetchMock, 1).origin).toBe(API_SERVERS[1])
  })

  it('бросает ApiError, если все зеркала ответили ошибкой', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => jsonResponse({}, 503)))
    await expect(fetchStations(makeParams())).rejects.toBeInstanceOf(ApiError)
  })

  it('не повторяет отменённый запрос', async () => {
    const controller = new AbortController()
    const fetchMock = vi.fn().mockImplementation(async () => {
      controller.abort()
      throw new DOMException('Aborted', 'AbortError')
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchStations(makeParams(), 0, controller.signal)).rejects.toThrow('Aborted')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('fetchCountries', () => {
  it('оставляет только страны с валидным кодом и станциями', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse([
          { name: 'Germany', iso_3166_1: 'DE', stationcount: 3000 },
          { name: 'Nowhere', iso_3166_1: '', stationcount: 5 },
          { name: 'Empty', iso_3166_1: 'EE', stationcount: 0 },
        ]),
      ),
    )
    expect(await fetchCountries()).toEqual([{ code: 'DE', name: 'Germany', stationCount: 3000 }])
  })
})
