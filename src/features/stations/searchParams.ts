import type { SearchParams } from '../../api/radioBrowser'

/** Есть ли что искать: без названия, страны и жанра запрос не отправляем. */
export const hasSearchCriteria = (params: SearchParams) =>
  Boolean(params.name || params.countryCode || params.tag)

export const isSameSearch = (a: SearchParams, b: SearchParams | null) =>
  b !== null &&
  a.name === b.name &&
  a.countryCode === b.countryCode &&
  a.tag === b.tag &&
  a.order === b.order &&
  a.httpsOnly === b.httpsOnly
