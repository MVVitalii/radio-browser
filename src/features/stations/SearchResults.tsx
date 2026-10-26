import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { EmptyState } from '../../components/EmptyState'
import { RadioIcon, SearchIcon, SignalOffIcon } from '../../components/icons'
import { StationGrid, StationGridSkeleton } from '../../components/StationGrid'
import { countryName } from '../../utils/country'
import { pluralize } from '../../utils/plural'
import {
  loadMoreStations,
  resetFilters,
  selectHasMore,
  selectLoadMore,
  selectSearchError,
  selectSearchParams,
  selectSearchStatus,
  selectStations,
  setFilters,
} from './stationsSlice'

const SUGGESTIONS = ['jazz', 'lofi', 'rock', 'classical', 'news', 'chill']

export function SearchResults({ onRetry }: { onRetry: () => void }) {
  const dispatch = useAppDispatch()
  const status = useAppSelector(selectSearchStatus)
  const stations = useAppSelector(selectStations)
  const error = useAppSelector(selectSearchError)
  const params = useAppSelector(selectSearchParams)
  const hasMore = useAppSelector(selectHasMore)
  const loadMore = useAppSelector(selectLoadMore)

  const description = params
    ? [
        params.name && `«${params.name}»`,
        params.tag && `#${params.tag}`,
        params.countryCode && countryName(params.countryCode),
      ]
        .filter(Boolean)
        .join(' · ')
    : ''

  const statusText =
    status === 'loading'
      ? 'Ищем станции…'
      : status === 'succeeded'
        ? `${stations.length}${hasMore ? '+' : ''} ${pluralize(stations.length, ['станция', 'станции', 'станций'])} · ${description}`
        : ''

  return (
    <div aria-busy={status === 'loading'}>
      <p aria-live="polite" className="mb-4 min-h-4 truncate font-mono text-xs text-ink-muted">
        {statusText}
      </p>

      {status === 'idle' && (
        <EmptyState icon={<RadioIcon className="size-9" />} title="Настройтесь на волну">
          <p>Введите название станции, выберите страну или жанр:</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => dispatch(setFilters({ tag }))}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-ink transition hover:border-amber-glow/60 hover:text-amber-glow"
              >
                #{tag}
              </button>
            ))}
          </div>
        </EmptyState>
      )}

      {status === 'loading' && <StationGridSkeleton />}

      {status === 'failed' && (
        <EmptyState icon={<SignalOffIcon className="size-9" />} title="Помехи в эфире" tone="signal">
          <p>{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 rounded-full bg-signal px-5 py-2 text-sm font-semibold text-night-950 transition hover:brightness-110 active:scale-95"
          >
            Попробовать снова
          </button>
        </EmptyState>
      )}

      {status === 'succeeded' && stations.length === 0 && (
        <EmptyState icon={<SearchIcon className="size-9" />} title="Тишина в эфире">
          <p>По этим условиям станций не нашлось. Измените запрос или фильтры.</p>
          {(params?.tag || params?.countryCode) && (
            <button
              type="button"
              onClick={() => dispatch(resetFilters())}
              className="mt-5 rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-ink transition hover:border-amber-glow/60 hover:text-amber-glow"
            >
              Сбросить фильтры
            </button>
          )}
        </EmptyState>
      )}

      {status === 'succeeded' && stations.length > 0 && (
        <>
          <StationGrid stations={stations} />
          {hasMore && (
            <div className="mt-8 flex flex-col items-center gap-2">
              {loadMore.status === 'failed' && (
                <p role="alert" className="text-sm text-signal">
                  {loadMore.error}
                </p>
              )}
              <button
                type="button"
                onClick={() => dispatch(loadMoreStations())}
                disabled={loadMore.status === 'loading'}
                className="glass rounded-full px-6 py-3 text-sm font-semibold text-ink transition hover:border-amber-glow/60 hover:text-amber-glow disabled:cursor-wait disabled:opacity-60"
              >
                {loadMore.status === 'loading'
                  ? 'Ловим ещё станции…'
                  : loadMore.status === 'failed'
                    ? 'Повторить'
                    : 'Загрузить ещё'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
