import { SEARCH_LIMIT } from '../../api/radioBrowser'
import { NETWORK_ERROR_MESSAGE } from '../../app/createAppAsyncThunk'
import { makeStore } from '../../app/store'
import { jsonResponse, makeParams, makeRawStation, mockRadioApi } from '../../test/utils'
import {
  clearResults,
  fetchFilterOptions,
  loadMoreStations,
  resetFilters,
  searchStations,
  setFilters,
} from './stationsSlice'

const page = (from: number, count: number) =>
  Array.from({ length: count }, (_, i) => makeRawStation({ stationuuid: `id-${from + i}` }))

describe('stations slice: поиск', () => {
  it('pending → succeeded', async () => {
    mockRadioApi({ search: () => [makeRawStation()] })
    const store = makeStore()

    const promise = store.dispatch(searchStations(makeParams()))
    expect(store.getState().stations).toMatchObject({ status: 'loading', params: { name: 'jazz' } })

    await promise
    const state = store.getState().stations
    expect(state.status).toBe('succeeded')
    expect(state.items).toHaveLength(1)
    expect(state.hasMore).toBe(false)
    expect(state.requestId).toBeNull()
  })

  it('pending → failed с понятным сообщением при сетевой ошибке', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const store = makeStore()

    await store.dispatch(searchStations(makeParams()))
    expect(store.getState().stations).toMatchObject({
      status: 'failed',
      error: NETWORK_ERROR_MESSAGE,
    })
  })

  it('игнорирует ответ устаревшего запроса', async () => {
    let resolveFirst: (value: Response) => void = () => {}
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockImplementationOnce(() => new Promise<Response>((resolve) => (resolveFirst = resolve)))
        .mockResolvedValueOnce(jsonResponse([makeRawStation({ stationuuid: 'new' })])),
    )
    const store = makeStore()

    const first = store.dispatch(searchStations(makeParams({ name: 'ja' })))
    await store.dispatch(searchStations(makeParams({ name: 'jazz' })))
    resolveFirst(jsonResponse([makeRawStation({ stationuuid: 'old' })]))
    await first

    const state = store.getState().stations
    expect(state.params?.name).toBe('jazz')
    expect(state.items.map((s) => s.id)).toEqual(['new'])
  })

  it('отменённый запрос не переводит в ошибку', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError')),
            )
          }),
      ),
    )
    const store = makeStore()

    const request = store.dispatch(searchStations(makeParams()))
    request.abort()
    store.dispatch(clearResults())
    await request

    expect(store.getState().stations.status).toBe('idle')
  })
})

describe('stations slice: загрузить ещё', () => {
  it('догружает следующую страницу со смещением и без дубликатов', async () => {
    const fetchMock = mockRadioApi({
      search: (url) =>
        url.searchParams.get('offset') === '0' ? page(0, SEARCH_LIMIT) : [...page(SEARCH_LIMIT - 1, 6)],
    })
    const store = makeStore()

    await store.dispatch(searchStations(makeParams()))
    expect(store.getState().stations.hasMore).toBe(true)

    await store.dispatch(loadMoreStations())
    const state = store.getState().stations
    expect(new URL(String(fetchMock.mock.calls[1][0])).searchParams.get('offset')).toBe(
      String(SEARCH_LIMIT),
    )
    expect(state.items).toHaveLength(SEARCH_LIMIT + 5)
    expect(state.hasMore).toBe(false)
    expect(state.loadMore.status).toBe('idle')
  })

  it('не запускается, если продолжения нет', async () => {
    const fetchMock = mockRadioApi({ search: () => page(0, 3) })
    const store = makeStore()

    await store.dispatch(searchStations(makeParams()))
    await store.dispatch(loadMoreStations())

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('ошибка догрузки не теряет уже найденные станции', async () => {
    let calls = 0
    mockRadioApi({
      search: () => {
        calls += 1
        if (calls > 1) throw new TypeError('Failed to fetch')
        return page(0, SEARCH_LIMIT)
      },
    })
    const store = makeStore()

    await store.dispatch(searchStations(makeParams()))
    await store.dispatch(loadMoreStations())

    const state = store.getState().stations
    expect(state.items).toHaveLength(SEARCH_LIMIT)
    expect(state.loadMore).toMatchObject({ status: 'failed', error: NETWORK_ERROR_MESSAGE })
  })
})

describe('stations slice: фильтры', () => {
  it('setFilters меняет только переданные поля, resetFilters возвращает умолчания', () => {
    const store = makeStore()
    store.dispatch(setFilters({ countryCode: 'DE', tag: 'jazz' }))
    expect(store.getState().stations.filters).toMatchObject({
      countryCode: 'DE',
      tag: 'jazz',
      order: 'clickcount',
    })

    store.dispatch(resetFilters())
    expect(store.getState().stations.filters).toMatchObject({ countryCode: '', tag: '' })
  })

  it('clearResults не сбрасывает фильтры', () => {
    const store = makeStore()
    store.dispatch(setFilters({ tag: 'rock' }))
    store.dispatch(clearResults())
    expect(store.getState().stations.filters.tag).toBe('rock')
  })

  it('списки стран и жанров грузятся один раз', async () => {
    const fetchMock = mockRadioApi({
      countries: [{ name: 'Germany', iso_3166_1: 'DE', stationcount: 10 }],
      tags: [{ name: 'jazz', stationcount: 100 }],
    })
    const store = makeStore()

    await Promise.all([store.dispatch(fetchFilterOptions()), store.dispatch(fetchFilterOptions())])

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(store.getState().stations.options).toMatchObject({
      status: 'succeeded',
      countries: [{ code: 'DE' }],
      tags: [{ name: 'jazz' }],
    })
  })
})
