import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { SearchParams } from '../../api/radioBrowser'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { hasSearchCriteria, isSameSearch } from './searchParams'
import { clearResults, searchStations, selectFilters, selectSearchParams } from './stationsSlice'

export const SEARCH_DEBOUNCE_MS = 400

/**
 * Запускает поиск по мере ввода и смены фильтров (с задержкой)
 * и отменяет предыдущий запрос, если условия поменялись.
 */
export function useStationSearch(query: string) {
  const dispatch = useAppDispatch()
  const filters = useAppSelector(selectFilters)
  const activeParams = useAppSelector(selectSearchParams)
  const requestRef = useRef<{ abort: () => void } | null>(null)

  const params = useMemo<SearchParams>(() => ({ name: query.trim(), ...filters }), [query, filters])

  const run = useCallback(
    (next: SearchParams) => {
      requestRef.current?.abort()
      requestRef.current = null
      if (!hasSearchCriteria(next)) {
        dispatch(clearResults())
        return
      }
      requestRef.current = dispatch(searchStations(next))
    },
    [dispatch],
  )

  useEffect(() => {
    if (isSameSearch(params, activeParams)) return
    if (!hasSearchCriteria(params) && activeParams === null) return
    const timer = setTimeout(() => run(params), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [params, activeParams, run])

  const searchNow = useCallback(() => run(params), [run, params])

  return { searchNow }
}
