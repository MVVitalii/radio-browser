export type TabId = 'search' | 'favorites'

export const tabId = (id: TabId) => `tab-${id}`
export const panelId = (id: TabId) => `panel-${id}`
