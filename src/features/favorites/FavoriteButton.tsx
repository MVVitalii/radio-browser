import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { HeartIcon } from '../../components/icons'
import type { Station } from '../../types/station'
import { selectIsFavorite } from './favoritesSelectors'
import { toggleFavorite } from './favoritesSlice'

export function FavoriteButton({ station }: { station: Station }) {
  const dispatch = useAppDispatch()
  const isFavorite = useAppSelector((state) => selectIsFavorite(state, station.id))

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={
        isFavorite
          ? `Убрать «${station.name}» из избранного`
          : `Добавить «${station.name}» в избранное`
      }
      onClick={() => dispatch(toggleFavorite(station))}
      className={`grid size-9 shrink-0 place-items-center rounded-full transition hover:bg-white/10 active:scale-90 ${
        isFavorite ? 'text-amber-deep' : 'text-ink-muted hover:text-ink'
      }`}
    >
      <HeartIcon filled={isFavorite} className="size-5" />
    </button>
  )
}
