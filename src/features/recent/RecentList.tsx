import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { EmptyState } from '../../components/EmptyState'
import { RadioIcon } from '../../components/icons'
import { StationGrid } from '../../components/StationGrid'
import { clearRecent, selectRecent } from './recentSlice'

export function RecentList() {
  const dispatch = useAppDispatch()
  const recent = useAppSelector(selectRecent)

  if (recent.length === 0) {
    return (
      <EmptyState icon={<RadioIcon className="size-9" />} title="Эфир ещё не начался">
        <p>Здесь появятся станции, которые вы слушали.</p>
      </EmptyState>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-mono text-xs text-ink-muted">Последние {recent.length} в эфире</p>
        <button
          type="button"
          onClick={() => dispatch(clearRecent())}
          className="text-sm text-ink-muted underline-offset-4 transition hover:text-amber-glow hover:underline"
        >
          Очистить историю
        </button>
      </div>
      <StationGrid stations={recent} />
    </div>
  )
}
