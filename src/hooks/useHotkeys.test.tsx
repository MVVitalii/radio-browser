import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { playStation } from '../features/player/playerSlice'
import { makeStation, mockRadioApi, renderWithStore } from '../test/utils'

describe('горячие клавиши', () => {
  beforeEach(() => {
    mockRadioApi()
  })

  it('/ переводит фокус в поиск', async () => {
    const user = userEvent.setup()
    renderWithStore(<App />)

    await user.keyboard('/')
    expect(screen.getByRole('searchbox', { name: 'Поиск станции по названию' })).toHaveFocus()
  })

  it('пробел ставит на паузу и снимает с неё, M выключает звук', async () => {
    const user = userEvent.setup()
    const { store } = renderWithStore(<App />)
    store.dispatch(playStation(makeStation()))

    await user.keyboard(' ')
    expect(store.getState().player.isPaused).toBe(true)
    await user.keyboard(' ')
    expect(store.getState().player.isPaused).toBe(false)

    await user.keyboard('m')
    expect(store.getState().player.isMuted).toBe(true)
  })

  it('не перехватывает клавиши, пока пользователь печатает', async () => {
    const user = userEvent.setup()
    const { store } = renderWithStore(<App />)
    store.dispatch(playStation(makeStation()))

    const input = screen.getByRole('searchbox', { name: 'Поиск станции по названию' })
    await user.type(input, 'a m/')

    expect(input).toHaveValue('a m/')
    expect(store.getState().player).toMatchObject({ isPaused: false, isMuted: false })
  })
})
