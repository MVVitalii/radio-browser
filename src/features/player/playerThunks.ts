import { fetchStationById, fetchStations } from '../../api/radioBrowser'
import { createAppAsyncThunk, toErrorMessage } from '../../app/createAppAsyncThunk'
import { setStationInUrl } from '../../utils/shareLink'
import { cueStation, playStation } from './playerSlice'

export const STATION_NOT_FOUND_MESSAGE = 'Станция по ссылке не найдена'

/** Открыть станцию по ссылке ?station=<id>: показать в плеере, но не запускать. */
export const cueStationById = createAppAsyncThunk(
  'player/cueStationById',
  async (id: string, { dispatch, signal, rejectWithValue }) => {
    try {
      const station = await fetchStationById(id, signal)
      if (!station) {
        setStationInUrl(null)
        return rejectWithValue(STATION_NOT_FOUND_MESSAGE)
      }
      dispatch(cueStation(station))
      return station
    } catch (error) {
      if (signal.aborted) throw error
      return rejectWithValue(toErrorMessage(error))
    }
  },
)

/** Сколько популярных станций берём для случайного выбора. */
export const LUCKY_POOL_SIZE = 100

/** «Мне повезёт»: случайная станция из популярных с учётом текущих фильтров. */
export const playRandomStation = createAppAsyncThunk(
  'player/playRandomStation',
  async (_: void, { dispatch, getState, signal, rejectWithValue }) => {
    const { stations, player } = getState()
    try {
      const { stations: pool } = await fetchStations(
        { ...stations.filters, name: '', order: 'clickcount' },
        0,
        signal,
        LUCKY_POOL_SIZE,
      )
      const candidates = pool.filter((station) => station.id !== player.station?.id)
      if (candidates.length === 0) {
        return rejectWithValue('Под эти фильтры не нашлось станций')
      }
      const station = candidates[Math.floor(Math.random() * candidates.length)]
      dispatch(playStation(station))
      return station
    } catch (error) {
      if (signal.aborted) throw error
      return rejectWithValue(toErrorMessage(error))
    }
  },
)
