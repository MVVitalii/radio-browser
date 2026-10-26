import { useState } from 'react'
import { useAppDispatch } from '../../app/hooks'
import { DiceIcon } from '../../components/icons'
import { useFlashMessage } from '../../hooks/useFlashMessage'
import { playRandomStation } from './playerThunks'

export function LuckyButton() {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [message, flash] = useFlashMessage(3500)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await dispatch(playRandomStation()).unwrap()
    } catch (error) {
      flash(typeof error === 'string' ? error : 'Не удалось поймать волну')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="group glass flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-signal/60 hover:text-signal hover:shadow-glow-signal disabled:cursor-wait disabled:opacity-70"
      >
        <DiceIcon
          className={`size-5 transition-transform duration-500 group-hover:rotate-180 ${isLoading ? 'animate-spin' : ''}`}
        />
        {isLoading ? 'Ловим волну…' : 'Мне повезёт'}
      </button>
      <p role="status" className="min-h-4 text-xs text-signal">
        {message}
      </p>
    </div>
  )
}
