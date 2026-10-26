import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'
import { makeRawStation, mockRadioApi, renderWithStore } from '../../test/utils'
import { playStation } from './playerSlice'
import { STATION_NOT_FOUND_MESSAGE, cueStationById } from './playerThunks'
import { makeStore } from '../../app/store'
import { toStation } from '../../api/radioBrowser'

const bar = () => screen.getByRole('region', { name: 'Сейчас играет' })

describe('ссылка на станцию', () => {
  it('открывает станцию из ?station= на паузе', async () => {
    window.history.replaceState(null, '', '/?station=shared-id')
    const byUuid = vi.fn((url: URL) => [
      makeRawStation({ stationuuid: url.searchParams.get('uuids')!, name: 'Shared FM' }),
    ])
    mockRadioApi({ byUuid })
    renderWithStore(<App />)

    expect(await within(await screen.findByRole('region', { name: 'Сейчас играет' })).findByText('Shared FM')).toBeInTheDocument()
    expect(within(bar()).getByRole('button', { name: 'Продолжить' })).toBeInTheDocument()
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled()
  })

  it('неизвестная станция — ошибка и чистая адресная строка', async () => {
    window.history.replaceState(null, '', '/?station=missing')
    mockRadioApi({ byUuid: () => [] })
    const store = makeStore()

    const result = await store.dispatch(cueStationById('missing'))

    expect(result.payload).toBe(STATION_NOT_FOUND_MESSAGE)
    expect(window.location.search).toBe('')
    expect(store.getState().player.station).toBeNull()
  })

  it('кнопка «Поделиться» копирует ссылку', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
    mockRadioApi()
    const { store } = renderWithStore(<App />)
    store.dispatch(playStation(toStation(makeRawStation({ stationuuid: 'abc', name: 'Jazz FM' }))!))

    await user.click(await screen.findByRole('button', { name: 'Поделиться станцией Jazz FM' }))

    expect(writeText).toHaveBeenCalledWith('http://localhost:3000/?station=abc')
    expect(await screen.findByText('Ссылка скопирована')).toBeInTheDocument()
  })
})

describe('«Мне повезёт»', () => {
  it('включает случайную популярную станцию с учётом фильтров', async () => {
    const user = userEvent.setup()
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const search = vi.fn(() => [
      makeRawStation({ stationuuid: '1', name: 'First FM' }),
      makeRawStation({ stationuuid: '2', name: 'Last FM' }),
    ])
    mockRadioApi({ search })
    renderWithStore(<App />)

    await user.click(screen.getByRole('button', { name: 'Мне повезёт' }))

    expect(await within(await screen.findByRole('region', { name: 'Сейчас играет' })).findByText('Last FM')).toBeInTheDocument()
    const url = search.mock.calls[0] as unknown as [URL]
    expect(url[0].searchParams.get('limit')).toBe('100')
    expect(url[0].searchParams.get('order')).toBe('clickcount')
  })

  it('не выбирает станцию, которая уже играет', async () => {
    const user = userEvent.setup()
    vi.spyOn(Math, 'random').mockReturnValue(0)
    mockRadioApi({
      search: () => [
        makeRawStation({ stationuuid: '1', name: 'Current FM' }),
        makeRawStation({ stationuuid: '2', name: 'Other FM' }),
      ],
    })
    const { store } = renderWithStore(<App />)
    store.dispatch(playStation(toStation(makeRawStation({ stationuuid: '1', name: 'Current FM' }))!))

    await user.click(await screen.findByRole('button', { name: 'Мне повезёт' }))

    expect(await within(bar()).findByText('Other FM')).toBeInTheDocument()
  })

  it('сообщает об ошибке', async () => {
    const user = userEvent.setup()
    mockRadioApi({ search: () => [] })
    renderWithStore(<App />)

    await user.click(screen.getByRole('button', { name: 'Мне повезёт' }))

    expect(await screen.findByText('Под эти фильтры не нашлось станций')).toBeInTheDocument()
  })
})
