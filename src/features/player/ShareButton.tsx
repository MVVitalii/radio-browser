import { ShareIcon } from '../../components/icons'
import { useFlashMessage } from '../../hooks/useFlashMessage'
import type { Station } from '../../types/station'
import { stationShareUrl } from '../../utils/shareLink'

/** На телефоне — системное меню «Поделиться», на компьютере — копирование ссылки. */
const prefersNativeShare = () =>
  typeof navigator.share === 'function' && window.matchMedia?.('(pointer: coarse)').matches

export function ShareButton({ station }: { station: Station }) {
  const [message, flash] = useFlashMessage()

  const handleShare = async () => {
    const url = stationShareUrl(station.id)
    try {
      if (prefersNativeShare()) {
        await navigator.share({ title: station.name, text: `Слушаю ${station.name}`, url })
        return
      }
      await navigator.clipboard.writeText(url)
      flash('Ссылка скопирована')
    } catch (error) {
      // Пользователь закрыл системное меню — это не ошибка.
      if (error instanceof DOMException && error.name === 'AbortError') return
      flash('Не удалось скопировать ссылку')
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleShare}
        aria-label={`Поделиться станцией ${station.name}`}
        className="grid size-9 shrink-0 place-items-center rounded-full text-ink-muted transition hover:bg-white/10 hover:text-ink active:scale-90"
      >
        <ShareIcon className="size-5" />
      </button>
      <p
        role="status"
        className={`pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-3 py-1 text-xs font-semibold text-night-950 shadow-lg transition ${
          message ? 'opacity-100' : 'translate-y-1 opacity-0'
        }`}
      >
        {message}
      </p>
    </div>
  )
}
