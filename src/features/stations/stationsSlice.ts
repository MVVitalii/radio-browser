import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Country, SearchParams, SortOrder, Tag } from '../../api/radioBrowser'
import { NETWORK_ERROR_MESSAGE } from '../../app/createAppAsyncThunk'
import type { Station } from '../../types/station'
import { isSecurePage } from '../../utils/stream'
import { fetchFilterOptions, loadMoreStations, searchStations } from './stationsThunks'

export type SearchStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type SearchFilters = Omit<SearchParams, 'name'>

export interface StationsState {
  filters: SearchFilters
  /** Параметры последнего запущенного поиска; null — поиска нет. */
  params: SearchParams | null
  items: Station[]
  status: SearchStatus
  error: string | null
  /** id актуального запроса: ответы устаревших запросов игнорируются. */
  requestId: string | null
  hasMore: boolean
  loadMore: {
    status: 'idle' | 'loading' | 'failed'
    error: string | null
    requestId: string | null
  }
  options: {
    countries: Country[]
    tags: Tag[]
    status: SearchStatus
  }
}

export const DEFAULT_ORDER: SortOrder = 'clickcount'

/** На https-сайте http-потоки блокируются браузером, поэтому по умолчанию прячем их. */
export const defaultFilters = (): SearchFilters => ({
  countryCode: '',
  tag: '',
  order: DEFAULT_ORDER,
  httpsOnly: isSecurePage(),
})

const initialLoadMore: StationsState['loadMore'] = { status: 'idle', error: null, requestId: null }

const initialState = (): StationsState => ({
  filters: defaultFilters(),
  params: null,
  items: [],
  status: 'idle',
  error: null,
  requestId: null,
  hasMore: false,
  loadMore: initialLoadMore,
  options: { countries: [], tags: [], status: 'idle' },
})

const stationsSlice = createSlice({
  name: 'stations',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<SearchFilters>>) {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters(state) {
      state.filters = defaultFilters()
    },
    clearResults(state) {
      const { filters, options } = state
      return { ...initialState(), filters, options }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchStations.pending, (state, action) => {
        state.status = 'loading'
        state.error = null
        state.params = action.meta.arg
        state.requestId = action.meta.requestId
        state.items = []
        state.hasMore = false
        state.loadMore = initialLoadMore
      })
      .addCase(searchStations.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        state.status = 'succeeded'
        state.items = action.payload.stations
        state.hasMore = action.payload.hasMore
        state.requestId = null
      })
      .addCase(searchStations.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        state.status = 'failed'
        state.error = action.payload ?? NETWORK_ERROR_MESSAGE
        state.requestId = null
      })
      .addCase(loadMoreStations.pending, (state, action) => {
        state.loadMore = { status: 'loading', error: null, requestId: action.meta.requestId }
      })
      .addCase(loadMoreStations.fulfilled, (state, action) => {
        if (state.loadMore.requestId !== action.meta.requestId) return
        const known = new Set(state.items.map((station) => station.id))
        state.items.push(...action.payload.stations.filter((station) => !known.has(station.id)))
        state.hasMore = action.payload.hasMore
        state.loadMore = initialLoadMore
      })
      .addCase(loadMoreStations.rejected, (state, action) => {
        if (state.loadMore.requestId !== action.meta.requestId) return
        state.loadMore = {
          status: 'failed',
          error: action.payload ?? NETWORK_ERROR_MESSAGE,
          requestId: null,
        }
      })
      .addCase(fetchFilterOptions.pending, (state) => {
        state.options.status = 'loading'
      })
      .addCase(fetchFilterOptions.fulfilled, (state, action) => {
        state.options = { ...action.payload, status: 'succeeded' }
      })
      .addCase(fetchFilterOptions.rejected, (state) => {
        state.options.status = 'failed'
      })
  },
  selectors: {
    selectStations: (state) => state.items,
    selectSearchStatus: (state) => state.status,
    selectSearchError: (state) => state.error,
    selectSearchParams: (state) => state.params,
    selectFilters: (state) => state.filters,
    selectHasMore: (state) => state.hasMore,
    selectLoadMore: (state) => state.loadMore,
    selectFilterOptions: (state) => state.options,
  },
})

export { fetchFilterOptions, loadMoreStations, searchStations }
export const { setFilters, resetFilters, clearResults } = stationsSlice.actions
export const {
  selectStations,
  selectSearchStatus,
  selectSearchError,
  selectSearchParams,
  selectFilters,
  selectHasMore,
  selectLoadMore,
  selectFilterOptions,
} = stationsSlice.selectors
export default stationsSlice.reducer
