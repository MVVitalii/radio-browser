import { useCallback, useRef, useState } from 'react'
import { useAppSelector } from './app/hooks'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { SearchBar } from './components/SearchBar'
import { panelId, tabId, type TabId } from './components/tabIds'
import { Tabs } from './components/Tabs'
import { selectFavoritesCount } from './features/favorites/favoritesSlice'
import { FavoritesList } from './features/favorites/FavoritesList'
import { LuckyButton } from './features/player/LuckyButton'
import { NowPlayingBar } from './features/player/NowPlayingBar'
import { useSharedStation } from './features/player/useSharedStation'
import { RecentList } from './features/recent/RecentList'
import { SearchFilters } from './features/stations/SearchFilters'
import { SearchResults } from './features/stations/SearchResults'
import { selectFilters } from './features/stations/stationsSlice'
import { useStationSearch } from './features/stations/useStationSearch'
import { useHotkeys } from './hooks/useHotkeys'

function App() {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<TabId>('search')
  const favoritesCount = useAppSelector(selectFavoritesCount)
  const filters = useAppSelector(selectFilters)
  const { searchNow } = useStationSearch(query)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const focusSearch = useCallback(() => searchInputRef.current?.focus(), [])
  useHotkeys({ onFocusSearch: focusSearch })
  useSharedStation()

  // Любое изменение условий поиска (в том числе клик по жанру в избранном) ведёт в эфир.
  const [prevFilters, setPrevFilters] = useState(filters)
  if (filters !== prevFilters) {
    setPrevFilters(filters)
    setActiveTab('search')
  }

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setActiveTab('search')
  }

  return (
    <>
      <div className="relative z-10 mx-auto min-h-screen max-w-6xl px-4 pb-44 pt-8 sm:px-6 sm:pb-36">
        <Header />
        <SearchBar
          value={query}
          onChange={handleQueryChange}
          onSubmit={searchNow}
          inputRef={searchInputRef}
        />
        <SearchFilters />
        <div className="mt-8 flex flex-wrap items-start justify-between gap-3">
          <Tabs active={activeTab} onChange={setActiveTab} favoritesCount={favoritesCount} />
          <LuckyButton />
        </div>

        <section
          id={panelId(activeTab)}
          role="tabpanel"
          aria-labelledby={tabId(activeTab)}
          className="mt-6"
        >
          {activeTab === 'search' && <SearchResults onRetry={searchNow} />}
          {activeTab === 'favorites' && <FavoritesList />}
          {activeTab === 'recent' && <RecentList />}
        </section>
        <Footer />
      </div>
      <NowPlayingBar />
    </>
  )
}

export default App
