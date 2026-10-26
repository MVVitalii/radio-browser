import { useCallback, useEffect, useRef, useState } from 'react'

/** Короткое сообщение, которое само исчезает через `duration` мс. */
export function useFlashMessage(duration = 2500) {
  const [message, setMessage] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flash = useCallback(
    (text: string) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setMessage(text)
      timerRef.current = setTimeout(() => setMessage(null), duration)
    },
    [duration],
  )

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  return [message, flash] as const
}
