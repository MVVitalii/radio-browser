import { makeStore } from '../../app/store'
import { makeStation } from '../../test/utils'
import { readStations } from '../../utils/storage'
import { playStation } from '../player/playerSlice'
import { clearRecent, RECENT_LIMIT, RECENT_STORAGE_KEY } from './recentSlice'

const recentIds = (store: ReturnType<typeof makeStore>) =>
  store.getState().recent.items.map((station) => station.id)

describe('recent slice', () => {
  it('запоминает включённые станции, последняя — сверху, без повторов', () => {
    const store = makeStore()
    store.dispatch(playStation(makeStation({ id: 'a' })))
    store.dispatch(playStation(makeStation({ id: 'b' })))
    store.dispatch(playStation(makeStation({ id: 'a' })))

    expect(recentIds(store)).toEqual(['a', 'b'])
  })

  it(`хранит не больше ${RECENT_LIMIT} станций`, () => {
    const store = makeStore()
    for (let i = 0; i < RECENT_LIMIT + 3; i++) {
      store.dispatch(playStation(makeStation({ id: `s${i}` })))
    }
    expect(recentIds(store)).toHaveLength(RECENT_LIMIT)
    expect(recentIds(store)[0]).toBe(`s${RECENT_LIMIT + 2}`)
  })

  it('сохраняется в localStorage и восстанавливается', () => {
    const store = makeStore()
    store.dispatch(playStation(makeStation({ id: 'saved' })))
    expect(readStations(RECENT_STORAGE_KEY).map((s) => s.id)).toEqual(['saved'])
    expect(recentIds(makeStore())).toEqual(['saved'])

    store.dispatch(clearRecent())
    expect(readStations(RECENT_STORAGE_KEY)).toEqual([])
  })
})
