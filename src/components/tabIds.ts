export type TabId = 'search' | 'favorites' | 'recent'

export const tabId = (id: TabId) => `tab-${id}`
export const panelId = (id: TabId) => `panel-${id}`
