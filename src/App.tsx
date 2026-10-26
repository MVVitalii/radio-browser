import { useState } from 'react'
import { useAppSelector } from './app/hooks'
import { Header } from './components/Header'
import { SearchBar } from './components/SearchBar'
import { panelId, tabId, type TabId } from './components/tabIds'
import { Tabs } from './components/Tabs'
import { selectFavoritesCount } from './features/favorites/favoritesSlice'
import { FavoritesList } from './features/favorites/FavoritesList'
import { NowPlayingBar } from './features/player/NowPlayingBar'
import { SearchResults } from './features/stations/SearchResults'
import { useStationSearch } from './features/stations/useStationSearch'

function App() {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<TabId>('search')
  const favoritesCount = useAppSelector(selectFavoritesCount)
  const { searchNow } = useStationSearch(query)

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setActiveTab('search')
  }

  return (
    <>
      <div className="relative z-10 mx-auto min-h-screen max-w-6xl px-4 pb-44 pt-8 sm:px-6 sm:pb-36">
        <Header />
        <SearchBar value={query} onChange={handleQueryChange} onSubmit={searchNow} />
        <Tabs active={activeTab} onChange={setActiveTab} favoritesCount={favoritesCount} />

        <section
          id={panelId(activeTab)}
          role="tabpanel"
          aria-labelledby={tabId(activeTab)}
          className="mt-6"
        >
          {activeTab === 'search' ? (
            <SearchResults onSuggestion={handleQueryChange} onRetry={searchNow} />
          ) : (
            <FavoritesList />
          )}
        </section>
      </div>
      <NowPlayingBar />
    </>
  )
}

export default App
