import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { makeStation, renderWithStore } from '../../test/utils'
import { NowPlayingBar } from './NowPlayingBar'
import { playStation } from './playerSlice'

const audio = () => document.querySelector('audio')!

describe('NowPlayingBar', () => {
  it('скрыта, пока станция не выбрана', () => {
    renderWithStore(<NowPlayingBar />)
    expect(screen.queryByRole('region', { name: 'Сейчас играет' })).not.toBeInTheDocument()
  })

  it('при паузе отключается от потока, а после — подключается заново', async () => {
    const user = userEvent.setup()
    const { store } = renderWithStore(<NowPlayingBar />)
    store.dispatch(playStation(makeStation()))

    await screen.findByRole('region', { name: 'Сейчас играет' })
    expect(audio().getAttribute('src')).toBe('https://example.com/stream')
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Пауза' }))
    expect(audio().hasAttribute('src')).toBe(false)

    await user.click(screen.getByRole('button', { name: 'Продолжить' }))
    expect(audio().getAttribute('src')).toBe('https://example.com/stream')
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2)
  })

  it('показывает ошибку, если поток не запустился', async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValue(
      new DOMException('Unsupported', 'NotSupportedError'),
    )
    const { store } = renderWithStore(<NowPlayingBar />)
    store.dispatch(playStation(makeStation()))

    expect(await screen.findByText('Поток недоступен')).toBeInTheDocument()
    expect(store.getState().player.isPaused).toBe(true)
  })

  it('запрет автозапуска — не ошибка, а пауза', async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValue(
      new DOMException('Blocked', 'NotAllowedError'),
    )
    const { store } = renderWithStore(<NowPlayingBar />)
    store.dispatch(playStation(makeStation()))

    expect(await screen.findByText('Пауза')).toBeInTheDocument()
  })
})
