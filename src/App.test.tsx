import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { jsonResponse, makeRawStation, renderWithStore } from './test/utils'

const user = userEvent.setup()
const searchInput = () => screen.getByRole('searchbox', { name: 'Поиск станции по названию' })

describe('App', () => {
  it('до поиска показывает приглашение', () => {
    renderWithStore(<App />)
    expect(screen.getByRole('heading', { name: 'Radio Browser' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Настройтесь на волну' })).toBeInTheDocument()
  })

  it('находит станции и показывает их списком', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse([
          makeRawStation({ stationuuid: '1', name: 'Jazz FM' }),
          makeRawStation({ stationuuid: '2', name: 'Smooth Jazz' }),
        ]),
      ),
    )
    renderWithStore(<App />)

    await user.type(searchInput(), 'jazz')

    expect(await screen.findByRole('heading', { name: 'Jazz FM' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Smooth Jazz' })).toBeInTheDocument()
    expect(screen.getByText('2 станции по запросу «jazz»')).toBeInTheDocument()
  })

  it('показывает пустой результат', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([])))
    renderWithStore(<App />)

    await user.type(searchInput(), 'zzzz{Enter}')

    expect(await screen.findByRole('heading', { name: 'Тишина в эфире' })).toBeInTheDocument()
  })

  it('показывает ошибку и позволяет повторить', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValue(new TypeError('Failed to fetch'))
    vi.stubGlobal('fetch', fetchMock)
    renderWithStore(<App />)

    await user.type(searchInput(), 'rock{Enter}')
    expect(await screen.findByRole('heading', { name: 'Помехи в эфире' })).toBeInTheDocument()

    fetchMock.mockResolvedValue(jsonResponse([makeRawStation({ name: 'Rock Radio' })]))
    await user.click(screen.getByRole('button', { name: 'Попробовать снова' }))
    expect(await screen.findByRole('heading', { name: 'Rock Radio' })).toBeInTheDocument()
  })

  it('играет станцию и не останавливает её при новом поиске', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([makeRawStation({ name: 'Jazz FM' })]))
      .mockResolvedValueOnce(jsonResponse([makeRawStation({ stationuuid: '2', name: 'Rock FM' })]))
    vi.stubGlobal('fetch', fetchMock)
    renderWithStore(<App />)

    await user.type(searchInput(), 'jazz{Enter}')
    await user.click(await screen.findByRole('button', { name: 'Слушать Jazz FM' }))

    const bar = screen.getByRole('region', { name: 'Сейчас играет' })
    expect(within(bar).getByText('Jazz FM')).toBeInTheDocument()

    await user.clear(searchInput())
    await user.type(searchInput(), 'rock{Enter}')
    await screen.findByRole('heading', { name: 'Rock FM' })

    expect(within(bar).getByText('Jazz FM')).toBeInTheDocument()
    expect(within(bar).getByRole('button', { name: 'Пауза' })).toBeInTheDocument()
  })

  it('избранное не сбрасывается при новом поиске', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([makeRawStation({ name: 'Jazz FM' })]))
      .mockResolvedValueOnce(jsonResponse([]))
    vi.stubGlobal('fetch', fetchMock)
    renderWithStore(<App />)

    await user.type(searchInput(), 'jazz{Enter}')
    await user.click(await screen.findByRole('button', { name: 'Добавить «Jazz FM» в избранное' }))

    await user.clear(searchInput())
    await user.type(searchInput(), 'nothing{Enter}')
    await screen.findByRole('heading', { name: 'Тишина в эфире' })

    await user.click(screen.getByRole('tab', { name: /Избранное/ }))
    expect(screen.getByRole('heading', { name: 'Jazz FM' })).toBeInTheDocument()
  })
})
