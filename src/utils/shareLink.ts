export const STATION_PARAM = 'station'

export const getStationIdFromUrl = () =>
  new URLSearchParams(window.location.search).get(STATION_PARAM)

/** Ссылка на станцию: открыв её, получатель увидит эту станцию в плеере. */
export function stationShareUrl(id: string): string {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  url.searchParams.set(STATION_PARAM, id)
  return url.toString()
}

/** Держим адресную строку в синхроне с текущей станцией, не засоряя историю. */
export function setStationInUrl(id: string | null): void {
  const url = new URL(window.location.href)
  if (id) {
    url.searchParams.set(STATION_PARAM, id)
  } else {
    url.searchParams.delete(STATION_PARAM)
  }
  window.history.replaceState(window.history.state, '', url)
}
