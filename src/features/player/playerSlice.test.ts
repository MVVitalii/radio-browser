import { makeStation } from '../../test/utils'
import reducer, { playStation, setVolume, togglePause } from './playerSlice'

describe('player slice', () => {
  const initial = reducer(undefined, { type: 'init' })

  it('playStation включает станцию и снимает паузу', () => {
    const state = reducer(initial, playStation(makeStation()))
    expect(state.station?.id).toBe('uuid-1')
    expect(state.isPaused).toBe(false)
  })

  it('togglePause работает только при выбранной станции', () => {
    expect(reducer(initial, togglePause()).isPaused).toBe(true)
    const playing = reducer(initial, playStation(makeStation()))
    expect(reducer(playing, togglePause()).isPaused).toBe(true)
  })

  it('громкость ограничена диапазоном 0…1', () => {
    expect(reducer(initial, setVolume(1.5)).volume).toBe(1)
    expect(reducer(initial, setVolume(-1)).volume).toBe(0)
    expect(reducer(initial, setVolume(0.3)).volume).toBe(0.3)
  })
})
