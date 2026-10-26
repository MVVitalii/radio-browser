import type { Station } from '../types/station'
import { StationCard } from './StationCard'

export const gridClassName = 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

export function StationGrid({ stations }: { stations: Station[] }) {
  return (
    <ul className={gridClassName}>
      {stations.map((station, index) => (
        <StationCard key={station.id} station={station} index={index} />
      ))}
    </ul>
  )
}

export function StationGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className={gridClassName} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="glass flex animate-pulse flex-col gap-4 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 rounded bg-white/10" />
              <div className="h-2.5 w-1/2 rounded bg-white/5" />
            </div>
          </div>
          <div className="flex gap-1.5">
            <div className="h-4 w-12 rounded-full bg-white/5" />
            <div className="h-4 w-16 rounded-full bg-white/5" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-2.5 w-20 rounded bg-white/5" />
            <div className="size-11 rounded-full bg-white/10" />
          </div>
        </li>
      ))}
    </ul>
  )
}
