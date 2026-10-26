import { useCallback, useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { clearResults, searchStations, selectSearchQuery } from './stationsSlice'

export const SEARCH_DEBOUNCE_MS = 400

/**
 * Запускает поиск по мере ввода (с задержкой) и отменяет предыдущий запрос,
 * если пользователь продолжил печатать.
 */
export function useStationSearch(query: string) {
  const dispatch = useAppDispatch()
  const lastQuery = useAppSelector(selectSearchQuery)
  const requestRef = useRef<{ abort: () => void } | null>(null)

  const run = useCallback(
    (value: string) => {
      requestRef.current?.abort()
      requestRef.current = null
      const trimmed = value.trim()
      if (!trimmed) {
        dispatch(clearResults())
        return
      }
      requestRef.current = dispatch(searchStations(trimmed))
    },
    [dispatch],
  )

  useEffect(() => {
    if (query.trim() === lastQuery) return
    const timer = setTimeout(() => run(query), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query, lastQuery, run])

  const searchNow = useCallback(() => run(query), [run, query])

  return { searchNow }
}
