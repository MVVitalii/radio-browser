import { useAppSelector } from '../../app/hooks'
import { EmptyState } from '../../components/EmptyState'
import { RadioIcon, SearchIcon, SignalOffIcon } from '../../components/icons'
import { StationGrid, StationGridSkeleton } from '../../components/StationGrid'
import { pluralize } from '../../utils/plural'
import {
  selectSearchError,
  selectSearchQuery,
  selectSearchStatus,
  selectStations,
} from './stationsSlice'

const SUGGESTIONS = ['jazz', 'lofi', 'rock', 'classical', 'news', 'chill']

interface SearchResultsProps {
  onSuggestion: (query: string) => void
  onRetry: () => void
}

export function SearchResults({ onSuggestion, onRetry }: SearchResultsProps) {
  const status = useAppSelector(selectSearchStatus)
  const stations = useAppSelector(selectStations)
  const error = useAppSelector(selectSearchError)
  const query = useAppSelector(selectSearchQuery)

  const statusText =
    status === 'loading'
      ? 'Ищем станции…'
      : status === 'succeeded'
        ? `${stations.length} ${pluralize(stations.length, ['станция', 'станции', 'станций'])} по запросу «${query}»`
        : ''

  return (
    <div aria-busy={status === 'loading'}>
      <p aria-live="polite" className="mb-4 min-h-4 font-mono text-xs text-ink-muted">
        {statusText}
      </p>

      {status === 'idle' && (
        <EmptyState icon={<RadioIcon className="size-9" />} title="Настройтесь на волну">
          <p>Введите название станции или попробуйте один из жанров:</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSuggestion(suggestion)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-ink transition hover:border-amber-glow/60 hover:text-amber-glow"
              >
                #{suggestion}
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
          <p>По запросу «{query}» станций не нашлось. Попробуйте другое название.</p>
        </EmptyState>
      )}

      {status === 'succeeded' && stations.length > 0 && <StationGrid stations={stations} />}
    </div>
  )
}
