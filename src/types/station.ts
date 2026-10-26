/** Станция в том виде, в котором она живёт в приложении (уже нормализованная). */
export interface Station {
  id: string
  name: string
  streamUrl: string
  homepage: string | null
  favicon: string | null
  country: string
  countryCode: string
  tags: string[]
  codec: string
  bitrate: number
}
