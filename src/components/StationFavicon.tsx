import { useState } from 'react'
import { RadioIcon } from './icons'

interface StationFaviconProps {
  src: string | null
  className?: string
}

/** Логотип станции; если его нет или он не загрузился — фирменная заглушка. */
export function StationFavicon({ src, className = 'size-12' }: StationFaviconProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showImage = src !== null && failedSrc !== src

  return (
    <div
      className={`${className} grid shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-linear-to-br from-night-700 to-night-800`}
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="size-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <RadioIcon className="size-1/2 text-amber-glow/80" />
      )}
    </div>
  )
}
