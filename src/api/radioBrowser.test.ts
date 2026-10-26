import { jsonResponse, makeRawStation } from '../test/utils'
import { API_SERVERS, ApiError, searchStationsByName, toStation } from './radioBrowser'

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

describe('searchStationsByName', () => {
  it('отправляет параметры поиска и убирает дубликаты', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse([makeRawStation(), makeRawStation(), makeRawStation({ stationuuid: 'uuid-2' })]))
    vi.stubGlobal('fetch', fetchMock)

    const stations = await searchStationsByName(' jazz fm ')

    expect(stations.map((s) => s.id)).toEqual(['uuid-1', 'uuid-2'])
    const url = new URL(fetchMock.mock.calls[0][0] as string)
    expect(url.origin).toBe(API_SERVERS[0])
    expect(url.pathname).toBe('/json/stations/search')
    expect(url.searchParams.get('name')).toBe('jazz fm')
    expect(url.searchParams.get('hidebroken')).toBe('true')
  })

  it('переключается на следующее зеркало при сетевой ошибке', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(jsonResponse([makeRawStation()]))
    vi.stubGlobal('fetch', fetchMock)

    await expect(searchStationsByName('jazz')).resolves.toHaveLength(1)
    expect(new URL(fetchMock.mock.calls[1][0] as string).origin).toBe(API_SERVERS[1])
  })

  it('бросает ApiError, если все зеркала ответили ошибкой', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => jsonResponse({}, 503)))
    await expect(searchStationsByName('jazz')).rejects.toBeInstanceOf(ApiError)
  })

  it('не повторяет отменённый запрос', async () => {
    const controller = new AbortController()
    const fetchMock = vi.fn().mockImplementation(async () => {
      controller.abort()
      throw new DOMException('Aborted', 'AbortError')
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(searchStationsByName('jazz', controller.signal)).rejects.toThrow('Aborted')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
