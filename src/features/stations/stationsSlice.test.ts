import { makeStore } from '../../app/store'
import { jsonResponse, makeRawStation } from '../../test/utils'
import { clearResults, NETWORK_ERROR_MESSAGE, searchStations } from './stationsSlice'

describe('stations slice', () => {
  it('pending → succeeded', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([makeRawStation()])))
    const store = makeStore()

    const promise = store.dispatch(searchStations('jazz'))
    expect(store.getState().stations).toMatchObject({ status: 'loading', query: 'jazz' })

    await promise
    const state = store.getState().stations
    expect(state.status).toBe('succeeded')
    expect(state.items).toHaveLength(1)
    expect(state.requestId).toBeNull()
  })

  it('pending → failed с понятным сообщением при сетевой ошибке', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const store = makeStore()

    await store.dispatch(searchStations('jazz'))
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

    const first = store.dispatch(searchStations('ja'))
    await store.dispatch(searchStations('jazz'))
    resolveFirst(jsonResponse([makeRawStation({ stationuuid: 'old' })]))
    await first

    const state = store.getState().stations
    expect(state.query).toBe('jazz')
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

    const request = store.dispatch(searchStations('jazz'))
    request.abort()
    store.dispatch(clearResults())
    await request

    expect(store.getState().stations.status).toBe('idle')
  })
})
