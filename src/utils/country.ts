const regionNames = new Intl.DisplayNames(['ru'], { type: 'region' })

/** Название страны по ISO-коду на русском; если не знаем код — запасное имя из API. */
export function countryName(code: string, fallback = code): string {
  try {
    return regionNames.of(code) ?? fallback
  } catch {
    return fallback
  }
}
