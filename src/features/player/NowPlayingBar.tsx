import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { Equalizer } from '../../components/Equalizer'
import { PauseIcon, PlayIcon, VolumeIcon } from '../../components/icons'
import { StationFavicon } from '../../components/StationFavicon'
import { isInsecureStream, isSecurePage } from '../../utils/stream'
import { FavoriteButton } from '../favorites/FavoriteButton'
import {
  selectCurrentStation,
  selectIsMuted,
  selectIsPaused,
  selectVolume,
  setPaused,
  setVolume,
  toggleMute,
  togglePause,
} from './playerSlice'
import { ShareButton } from './ShareButton'
import { useMediaSession } from './useMediaSession'

type StreamState = 'connecting' | 'playing' | 'error'

/**
 * Панель «сейчас играет». Сам <audio> живёт здесь, вне Redux:
 * в сторе только сериализуемое состояние, а эффекты синхронизируют с ним элемент.
 * Компонент смонтирован на уровне App, поэтому поиск не прерывает воспроизведение.
 */
export function NowPlayingBar() {
  const dispatch = useAppDispatch()
  const station = useAppSelector(selectCurrentStation)
  const isPaused = useAppSelector(selectIsPaused)
  const volume = useAppSelector(selectVolume)
  const isMuted = useAppSelector(selectIsMuted)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [streamState, setStreamState] = useState<StreamState>('connecting')
  const streamUrl = station?.streamUrl

  useMediaSession(station, isPaused)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !streamUrl) return
    if (isPaused) {
      // Живой эфир не «замораживаем», а отключаемся от потока:
      // после паузы играем с текущего момента и не качаем данные впустую.
      audio.pause()
      if (audio.hasAttribute('src')) {
        audio.removeAttribute('src')
        audio.load()
      }
      return
    }
    if (audio.getAttribute('src') !== streamUrl) {
      audio.src = streamUrl
      setStreamState('connecting')
    }
    audio.play().catch((error: unknown) => {
      if (error instanceof DOMException) {
        // play() прерван сменой src — это нормально.
        if (error.name === 'AbortError') return
        // Браузер запретил автозапуск без жеста пользователя — просто ждём нажатия play.
        if (error.name === 'NotAllowedError') {
          dispatch(setPaused(true))
          return
        }
      }
      setStreamState('error')
      dispatch(setPaused(true))
    })
  }, [streamUrl, isPaused, dispatch])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted
  }, [isMuted])

  const handleStreamError = () => {
    // Ошибка от сброса src при паузе — не ошибка потока.
    if (!audioRef.current?.getAttribute('src')) return
    setStreamState('error')
    dispatch(setPaused(true))
  }

  const errorLabel =
    station && isSecurePage() && isInsecureStream(station)
      ? 'Браузер блокирует http-поток'
      : 'Поток недоступен'

  const status = isPaused
    ? streamState === 'error'
      ? { label: errorLabel, className: 'text-signal' }
      : { label: 'Пауза', className: 'text-ink-muted' }
    : streamState === 'playing'
      ? { label: 'В эфире', className: 'text-amber-glow animate-on-air' }
      : { label: 'Подключение…', className: 'text-ink-muted animate-pulse' }

  return (
    <>
      <audio
        ref={audioRef}
        preload="none"
        onPlaying={() => setStreamState('playing')}
        onWaiting={() => setStreamState('connecting')}
        onError={handleStreamError}
      />
      {station && (
        <div className="animate-rise fixed inset-x-0 bottom-0 z-20 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:px-6">
          <section
            aria-label="Сейчас играет"
            className="glass mx-auto flex max-w-4xl flex-wrap items-center gap-x-3 gap-y-2 rounded-3xl p-3 shadow-2xl shadow-black/50 sm:flex-nowrap sm:gap-4 sm:p-4"
          >
            <StationFavicon src={station.favicon} className="size-12 sm:size-14" />

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest">
                {!isPaused && streamState === 'playing' && <Equalizer />}
                <span className={status.className}>{status.label}</span>
              </p>
              <p className="truncate font-display text-sm font-bold sm:text-base" title={station.name}>
                {station.name}
              </p>
            </div>

            <div className="flex items-center">
              <ShareButton station={station} />
              <FavoriteButton station={station} />
            </div>

            <div className="order-last flex w-full items-center gap-2 sm:order-none sm:w-44">
              <button
                type="button"
                onClick={() => dispatch(toggleMute())}
                aria-label={isMuted ? 'Включить звук' : 'Выключить звук'}
                aria-pressed={isMuted}
                className="grid size-9 shrink-0 place-items-center rounded-full text-ink-muted transition hover:bg-white/10 hover:text-ink"
              >
                <VolumeIcon muted={isMuted} className="size-5" />
              </button>
              <label className="flex flex-1 items-center">
                <span className="sr-only">Громкость</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(event) => dispatch(setVolume(Number(event.target.value)))}
                  className="w-full accent-amber-glow"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => dispatch(togglePause())}
              aria-label={isPaused ? 'Продолжить' : 'Пауза'}
              className="grid size-12 shrink-0 place-items-center rounded-full bg-amber-glow text-night-950 shadow-glow transition hover:brightness-110 active:scale-90 sm:size-14"
            >
              {isPaused ? <PlayIcon className="ml-0.5 size-6" /> : <PauseIcon className="size-6" />}
            </button>
          </section>
        </div>
      )}
    </>
  )
}
