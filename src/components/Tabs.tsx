import { tabId, panelId, type TabId } from './tabIds'

interface TabsProps {
  active: TabId
  onChange: (tab: TabId) => void
  favoritesCount: number
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'search', label: 'Эфир' },
  { id: 'favorites', label: 'Избранное' },
  { id: 'recent', label: 'Недавние' },
]

export function Tabs({ active, onChange, favoritesCount }: TabsProps) {
  return (
    <div role="tablist" aria-label="Разделы" className="glass inline-flex rounded-full p-1">
      {TABS.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            id={tabId(tab.id)}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={panelId(tab.id)}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm sm:px-4 font-semibold transition ${
              isActive ? 'bg-amber-glow text-night-950' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {tab.label}
            {tab.id === 'favorites' && favoritesCount > 0 && (
              <span
                className={`rounded-full px-1.5 font-mono text-[11px] ${
                  isActive ? 'bg-night-950/20' : 'bg-white/10'
                }`}
              >
                {favoritesCount}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
