import type { Station } from '../types/station'

/** Поток по незащищённому http: на https-странице браузер его может заблокировать (mixed content). */
export const isInsecureStream = (station: Pick<Station, 'streamUrl'>) =>
  station.streamUrl.startsWith('http://')

export const isSecurePage = () => window.location.protocol === 'https:'
