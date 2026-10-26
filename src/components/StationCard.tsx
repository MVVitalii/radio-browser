import type { CSSProperties } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { FavoriteButton } from '../features/favorites/FavoriteButton'
import {
  playStation,
  selectCurrentStation,
  selectIsPaused,
  togglePause,
} from '../features/player/playerSlice'
import type { Station } from '../types/station'
import { isInsecureStream } from '../utils/stream'
import { Equalizer } from './Equalizer'
import { PauseIcon, PlayIcon } from './icons'
import { StationFavicon } from './StationFavicon'

interface StationCardProps {
  station: Station
  index: number
}

export function StationCard({ station, index }: StationCardProps) {
  const dispatch = useAppDispatch()
  const isCurrent = useAppSelector(selectCurrentStation)?.id === station.id
  const isPaused = useAppSelector(selectIsPaused)
  const isPlaying = isCurrent && !isPaused

  const handlePlay = () => dispatch(isCurrent ? togglePause() : playStation(station))
  const details = [station.codec, station.bitrate > 0 ? `${station.bitrate} kbps` : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <li
      className="animate-rise"
      style={{ animationDelay: `${Math.min(index, 12) * 35}ms` } as CSSProperties}
    >
      <article
        className={`glass flex h-full flex-col gap-4 rounded-2xl p-4 transition duration-300 hover:-translate-y-0.5 hover:border-white/20 ${
          isCurrent ? 'border-amber-glow/50 shadow-glow' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          <StationFavicon src={station.favicon} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-sm font-bold" title={station.name}>
              {station.name}
            </h3>
            <p className="mt-0.5 truncate text-xs text-ink-muted">
              {station.country || 'Страна не указана'}
            </p>
          </div>
          <FavoriteButton station={station} />
        </div>

        {station.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Жанры">
            {station.tags.slice(0, 3).map((tag) => (
              <li
                key={tag}
                className="max-w-full truncate rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] text-ink-muted"
              >
                #{tag}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2 font-mono text-[11px] uppercase text-ink-muted">
            {isPlaying && <Equalizer />}
            <span className="truncate">{details || 'stream'}</span>
            {isInsecureStream(station) && (
              <span
                title="Незащищённый поток: на https-сайте браузер может его заблокировать"
                className="rounded border border-white/15 px-1 text-[9px] leading-4 text-ink-muted/80"
              >
                http
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={handlePlay}
            aria-label={isPlaying ? `Пауза: ${station.name}` : `Слушать ${station.name}`}
            className={`grid size-11 shrink-0 place-items-center rounded-full transition active:scale-90 ${
              isCurrent
                ? 'bg-amber-glow text-night-950 shadow-glow'
                : 'bg-white/10 text-ink hover:bg-amber-glow hover:text-night-950'
            }`}
          >
            {isPlaying ? <PauseIcon className="size-5" /> : <PlayIcon className="ml-0.5 size-5" />}
          </button>
        </div>
      </article>
    </li>
  )
}
