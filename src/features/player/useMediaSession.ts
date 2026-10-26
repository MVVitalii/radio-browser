import { useEffect } from 'react'
import { useAppDispatch } from '../../app/hooks'
import type { Station } from '../../types/station'
import { countryName } from '../../utils/country'
import { setPaused } from './playerSlice'

const ACTIONS: MediaSessionAction[] = ['play', 'pause', 'stop']

/**
 * Media Session API: название и логотип станции на экране блокировки
 * и в системном медиа-виджете, управление кнопками гарнитуры и клавиатуры.
 */
export function useMediaSession(station: Station | null, isPaused: boolean) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    if (!station || typeof MediaMetadata === 'undefined') {
      navigator.mediaSession.metadata = null
      return
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: station.name,
      artist: station.countryCode
        ? countryName(station.countryCode, station.country)
        : station.country || 'Интернет-радио',
      album: 'Radio Browser',
      artwork: station.favicon ? [{ src: station.favicon, sizes: '512x512' }] : [],
    })
  }, [station])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.playbackState = !station ? 'none' : isPaused ? 'paused' : 'playing'
  }, [station, isPaused])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    const session = navigator.mediaSession
    const handle = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
      try {
        session.setActionHandler(action, handler)
      } catch {
        // Браузер не поддерживает это действие — пропускаем.
      }
    }
    for (const action of ACTIONS) {
      handle(action, () => dispatch(setPaused(action !== 'play')))
    }
    return () => ACTIONS.forEach((action) => handle(action, null))
  }, [dispatch])
}
