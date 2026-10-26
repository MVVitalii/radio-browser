import '@testing-library/jest-dom/vitest'
import { persistence, startPersistence } from '../app/persistence'

// В jsdom нет реализации воспроизведения медиа.
beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {})
})

afterEach(() => {
  // Отменяем отложенные записи в localStorage, чтобы они не протекли в следующий тест.
  persistence.clearListeners()
  startPersistence()
  localStorage.clear()
  window.history.replaceState(null, '', '/')
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
