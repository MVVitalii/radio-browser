import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { SEARCH_LIMIT } from './api/radioBrowser'
import { makeRawStation, mockRadioApi, renderWithStore } from './test/utils'

const searchInput = () => screen.getByRole('searchbox', { name: 'Поиск станции по названию' })

describe('App', () => {
  let user: ReturnType<typeof userEvent.setup>
  beforeEach(() => {
    user = userEvent.setup()
  })

  it('до поиска показывает приглашение', () => {
    mockRadioApi()
    renderWithStore(<App />)
    expect(screen.getByRole('heading', { name: 'Radio Browser' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Настройтесь на волну' })).toBeInTheDocument()
  })

  it('находит станции и показывает их списком', async () => {
    mockRadioApi({
      search: () => [
        makeRawStation({ stationuuid: '1', name: 'Jazz FM' }),
        makeRawStation({ stationuuid: '2', name: 'Smooth Jazz' }),
      ],
    })
    renderWithStore(<App />)

    await user.type(searchInput(), 'jazz')

    expect(await screen.findByRole('heading', { name: 'Jazz FM' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Smooth Jazz' })).toBeInTheDocument()
    expect(screen.getByText('2 станции · «jazz»')).toBeInTheDocument()
  })

  it('показывает пустой результат', async () => {
    mockRadioApi({ search: () => [] })
    renderWithStore(<App />)

    await user.type(searchInput(), 'zzzz{Enter}')

    expect(await screen.findByRole('heading', { name: 'Тишина в эфире' })).toBeInTheDocument()
  })

  it('показывает ошибку и позволяет повторить', async () => {
    let fail = true
    mockRadioApi({
      search: () => {
        if (fail) throw new TypeError('Failed to fetch')
        return [makeRawStation({ name: 'Rock Radio' })]
      },
    })
    renderWithStore(<App />)

    await user.type(searchInput(), 'rock{Enter}')
    expect(await screen.findByRole('heading', { name: 'Помехи в эфире' })).toBeInTheDocument()

    fail = false
    await user.click(screen.getByRole('button', { name: 'Попробовать снова' }))
    expect(await screen.findByRole('heading', { name: 'Rock Radio' })).toBeInTheDocument()
  })

  it('ищет по жанру из подсказки и по стране из фильтра', async () => {
    const search = vi.fn((url: URL) => [
      makeRawStation({ name: `Station ${url.searchParams.get('tag')} ${url.searchParams.get('countrycode') ?? ''}` }),
    ])
    mockRadioApi({
      search,
      countries: [{ name: 'Germany', iso_3166_1: 'DE', stationcount: 10 }],
    })
    renderWithStore(<App />)

    await user.click(screen.getByRole('button', { name: '#jazz' }))
    expect(await screen.findByRole('heading', { name: /Station jazz/ })).toBeInTheDocument()

    await user.selectOptions(await screen.findByRole('combobox', { name: 'Страна' }), 'DE')
    expect(await screen.findByRole('heading', { name: 'Station jazz DE' })).toBeInTheDocument()
  })

  it('«Загрузить ещё» дописывает станции в конец списка', async () => {
    mockRadioApi({
      search: (url) =>
        url.searchParams.get('offset') === '0'
          ? Array.from({ length: SEARCH_LIMIT }, (_, i) =>
              makeRawStation({ stationuuid: `id-${i}`, name: `Station ${i}` }),
            )
          : [makeRawStation({ stationuuid: 'extra', name: 'Extra Station' })],
    })
    renderWithStore(<App />)

    await user.type(searchInput(), 'fm{Enter}')
    await user.click(await screen.findByRole('button', { name: 'Загрузить ещё' }))

    expect(await screen.findByRole('heading', { name: 'Extra Station' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Station 0' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Загрузить ещё' })).not.toBeInTheDocument()
  })

  it('играет станцию и не останавливает её при новом поиске', async () => {
    mockRadioApi({
      search: (url) =>
        url.searchParams.get('name') === 'jazz'
          ? [makeRawStation({ name: 'Jazz FM' })]
          : [makeRawStation({ stationuuid: '2', name: 'Rock FM' })],
    })
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

  it('прослушанная станция появляется в «Недавних»', async () => {
    mockRadioApi({ search: () => [makeRawStation({ name: 'Jazz FM' })] })
    renderWithStore(<App />)

    await user.click(screen.getByRole('tab', { name: 'Недавние' }))
    expect(screen.getByRole('heading', { name: 'Эфир ещё не начался' })).toBeInTheDocument()

    await user.type(searchInput(), 'jazz{Enter}')
    await user.click(await screen.findByRole('button', { name: 'Слушать Jazz FM' }))
    await user.click(screen.getByRole('tab', { name: 'Недавние' }))

    const panel = screen.getByRole('tabpanel')
    expect(within(panel).getByRole('heading', { name: 'Jazz FM' })).toBeInTheDocument()
  })

  it('избранное не сбрасывается при новом поиске', async () => {
    mockRadioApi({
      search: (url) =>
        url.searchParams.get('name') === 'jazz' ? [makeRawStation({ name: 'Jazz FM' })] : [],
    })
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
