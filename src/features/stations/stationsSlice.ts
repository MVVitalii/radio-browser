import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { ApiError, searchStationsByName } from '../../api/radioBrowser'
import type { Station } from '../../types/station'

export type SearchStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface StationsState {
  query: string
  items: Station[]
  status: SearchStatus
  error: string | null
  /** id актуального запроса: ответы устаревших запросов игнорируются. */
  requestId: string | null
}

const initialState: StationsState = {
  query: '',
  items: [],
  status: 'idle',
  error: null,
  requestId: null,
}

export const NETWORK_ERROR_MESSAGE = 'Не удалось связаться с Radio Browser. Проверьте соединение.'

export const searchStations = createAsyncThunk<Station[], string, { rejectValue: string }>(
  'stations/search',
  async (query, { signal, rejectWithValue }) => {
    try {
      return await searchStationsByName(query, signal)
    } catch (error) {
      if (signal.aborted) throw error
      return rejectWithValue(error instanceof ApiError ? error.message : NETWORK_ERROR_MESSAGE)
    }
  },
)

const stationsSlice = createSlice({
  name: 'stations',
  initialState,
  reducers: {
    clearResults: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchStations.pending, (state, action) => {
        state.status = 'loading'
        state.error = null
        state.query = action.meta.arg
        state.requestId = action.meta.requestId
      })
      .addCase(searchStations.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        state.status = 'succeeded'
        state.items = action.payload
        state.requestId = null
      })
      .addCase(searchStations.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        state.status = 'failed'
        state.items = []
        state.error = action.payload ?? NETWORK_ERROR_MESSAGE
        state.requestId = null
      })
  },
  selectors: {
    selectStations: (state) => state.items,
    selectSearchStatus: (state) => state.status,
    selectSearchError: (state) => state.error,
    selectSearchQuery: (state) => state.query,
  },
})

export const { clearResults } = stationsSlice.actions
export const { selectStations, selectSearchStatus, selectSearchError, selectSearchQuery } =
  stationsSlice.selectors
export default stationsSlice.reducer
