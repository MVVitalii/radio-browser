import { act } from '@testing-library/react'
import { makeStation, renderWithStore } from '../../test/utils'
import { NowPlayingBar } from './NowPlayingBar'
import { playStation } from './playerSlice'

class FakeMediaMetadata {
  title: string
  artist: string
  artwork: unknown[]
  constructor(init: { title: string; artist: string; artwork: unknown[] }) {
    this.title = init.title
    this.artist = init.artist
    this.artwork = init.artwork
  }
}

describe('Media Session', () => {
  let session: {
    metadata: FakeMediaMetadata | null
    playbackState: string
    setActionHandler: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    session = { metadata: null, playbackState: 'none', setActionHandler: vi.fn() }
    Object.defineProperty(navigator, 'mediaSession', { value: session, configurable: true })
    vi.stubGlobal('MediaMetadata', FakeMediaMetadata)
  })

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'mediaSession')
  })

  it('показывает станцию в системном плеере и обрабатывает кнопки', () => {
    const { store } = renderWithStore(<NowPlayingBar />)
    act(() => {
      store.dispatch(playStation(makeStation({ name: 'Jazz FM', countryCode: 'DE', favicon: 'https://x/logo.png' })))
    })

    expect(session.metadata).toMatchObject({
      title: 'Jazz FM',
      artist: 'Германия',
      artwork: [{ src: 'https://x/logo.png' }],
    })
    expect(session.playbackState).toBe('playing')

    const pauseHandler = session.setActionHandler.mock.calls.find(([action]) => action === 'pause')?.[1]
    act(() => pauseHandler())
    expect(store.getState().player.isPaused).toBe(true)
    expect(session.playbackState).toBe('paused')
  })
})
