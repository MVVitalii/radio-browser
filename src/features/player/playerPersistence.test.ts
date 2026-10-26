import { makeStore } from '../../app/store'
import { makeStation } from '../../test/utils'
import { readJson } from '../../utils/storage'
import { cueStation, PLAYER_STORAGE_KEY, playStation, setVolume } from './playerSlice'

describe('сохранение плеера', () => {
  it('пишет громкость один раз после серии изменений', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const store = makeStore()
    for (const volume of [0.1, 0.2, 0.3, 0.4]) store.dispatch(setVolume(volume))

    await vi.waitFor(() => expect(readJson(PLAYER_STORAGE_KEY)).toMatchObject({ volume: 0.4 }))
    expect(setItem.mock.calls.filter(([key]) => key === PLAYER_STORAGE_KEY)).toHaveLength(1)
  })

  it('восстанавливает станцию и громкость, но стартует на паузе', async () => {
    const store = makeStore()
    store.dispatch(playStation(makeStation({ id: 'last' })))
    store.dispatch(setVolume(0.35))
    await vi.waitFor(() => expect(readJson(PLAYER_STORAGE_KEY)).toMatchObject({ volume: 0.35 }))

    expect(makeStore().getState().player).toMatchObject({
      station: { id: 'last' },
      volume: 0.35,
      isPaused: true,
      isMuted: false,
    })
  })

  it('битые данные не ломают плеер', () => {
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify({ station: { nope: 1 }, volume: 'loud' }))
    expect(makeStore().getState().player).toMatchObject({ station: null, volume: 0.8 })
  })
})

describe('ссылка в адресной строке', () => {
  it('отражает текущую станцию', () => {
    const store = makeStore()
    store.dispatch(playStation(makeStation({ id: 'abc' })))
    expect(window.location.search).toBe('?station=abc')

    store.dispatch(cueStation(makeStation({ id: 'xyz' })))
    expect(window.location.search).toBe('?station=xyz')
  })

  it('cueStation не попадает в «Недавние»', () => {
    const store = makeStore()
    store.dispatch(cueStation(makeStation({ id: 'shared' })))
    expect(store.getState().recent.items).toEqual([])
  })
})
