import { fetchCountries, fetchStations, fetchTags, type SearchParams } from '../../api/radioBrowser'
import { createAppAsyncThunk, toErrorMessage } from '../../app/createAppAsyncThunk'

export const searchStations = createAppAsyncThunk(
  'stations/search',
  async (params: SearchParams, { signal, rejectWithValue }) => {
    try {
      return await fetchStations(params, 0, signal)
    } catch (error) {
      if (signal.aborted) throw error
      return rejectWithValue(toErrorMessage(error))
    }
  },
)

/** Следующая страница текущего поиска. */
export const loadMoreStations = createAppAsyncThunk(
  'stations/loadMore',
  async (_: void, { getState, signal, rejectWithValue }) => {
    const { params, items } = getState().stations
    try {
      return await fetchStations(params!, items.length, signal)
    } catch (error) {
      if (signal.aborted) throw error
      return rejectWithValue(toErrorMessage(error))
    }
  },
  {
    condition: (_, { getState }) => {
      const { params, hasMore, status, loadMore } = getState().stations
      return params !== null && hasMore && status === 'succeeded' && loadMore.status !== 'loading'
    },
  },
)

/** Списки стран и жанров для фильтров — грузим один раз. */
export const fetchFilterOptions = createAppAsyncThunk(
  'stations/fetchFilterOptions',
  async (_: void, { signal, rejectWithValue }) => {
    try {
      const [countries, tags] = await Promise.all([fetchCountries(signal), fetchTags(signal)])
      return { countries, tags }
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  },
  {
    condition: (_, { getState }) => getState().stations.options.status === 'idle',
  },
)
