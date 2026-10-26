import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { selectCurrentStation, toggleMute, togglePause } from '../features/player/playerSlice'

const INTERACTIVE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'])

/** Пользователь печатает или работает с контролом — горячие клавиши не перехватываем. */
const isInteractiveTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || INTERACTIVE_TAGS.has(target.tagName))

/**
 * Пробел — пауза, M — звук, / — к поиску.
 * Используем event.code, чтобы клавиши работали и в русской раскладке.
 */
export function useHotkeys({ onFocusSearch }: { onFocusSearch: () => void }) {
  const dispatch = useAppDispatch()
  const hasStation = useAppSelector(selectCurrentStation) !== null

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return
      if (isInteractiveTarget(event.target)) return

      if (event.code === 'Slash' || event.key === '/') {
        event.preventDefault()
        onFocusSearch()
        return
      }
      if (!hasStation) return
      if (event.code === 'Space') {
        event.preventDefault()
        dispatch(togglePause())
      } else if (event.code === 'KeyM') {
        dispatch(toggleMute())
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dispatch, hasStation, onFocusSearch])
}
