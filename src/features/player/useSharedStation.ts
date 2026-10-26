import { useEffect } from 'react'
import { useAppDispatch } from '../../app/hooks'
import { getStationIdFromUrl } from '../../utils/shareLink'
import { cueStationById } from './playerThunks'

/** Если приложение открыли по ссылке ?station=<id> — подгружаем эту станцию в плеер. */
export function useSharedStation() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const id = getStationIdFromUrl()
    if (!id) return
    const request = dispatch(cueStationById(id))
    return () => request.abort()
  }, [dispatch])
}
