# Radio Browser — night broadcast

**Live demo: [radio-browser-iota.vercel.app](https://radio-browser-iota.vercel.app/)**

Internet radio built with React and TypeScript. This portfolio project shows Redux Toolkit and working with a third-party REST API through `fetch`. It has no backend of its own: stations come from the public [Radio Browser API](https://www.radio-browser.info/). The UI is in Russian.

## Features

**Search**
- Search by name with a debounced input; stale requests are cancelled.
- Filters: country, genre, sort order (popularity, rating, bitrate, name) and "HTTPS only".
- Clicking a genre on a station card searches by that genre right away.
- "Load more" fetches the next page of results.
- Dedicated states for loading (skeletons), errors with retry, empty results and the start screen.

**Player**
- A station keeps playing while you search for another one. The "now playing" bar at the bottom has pause, volume, mute, favorite and share.
- After a pause, the live stream resumes from the current moment instead of lagging behind.
- Volume and the last station survive a page reload.
- Media Session API: the station shows on the lock screen and in the system media widget, and headset buttons control playback.
- Keyboard shortcuts: `Space` pauses, `M` mutes, `/` focuses search.
- "I'm feeling lucky" picks a random station from the top 100, respecting the current filters.
- A station link `?station=<id>` opens that station in the recipient's player.

**Favorites and history**
- Favorites are stored in `localStorage` and survive new searches, with text filtering and sorting.
- "Recent" lists the last 10 stations played.

**Interface**: responsive from 360 px, accessible from the keyboard and to screen readers, and it respects "reduce motion".

## Stack

React 19 · TypeScript (strict) · Redux Toolkit 2 · Tailwind CSS 4 · Vite · Vitest + Testing Library

## Architecture

```
src/
  api/radioBrowser.ts        fetch client: mirrors, response normalization, ApiError
  app/
    store.ts                 configureStore, four slices
    persistence.ts           listener middleware: localStorage and the address bar
    createAppAsyncThunk.ts   typed createAsyncThunk
    hooks.ts                 useAppDispatch / useAppSelector
  features/
    stations/                search, filters, "load more"
    player/                  player, Media Session, links, "I'm feeling lucky"
    favorites/               favorites and memoized selectors
    recent/                  recently played
  components/                presentational components
  hooks/                     keyboard shortcuts, toasts
```

| Slice | State |
|---|---|
| `stations` | filters, active search params, results, status, `hasMore`, pagination, country and genre lists |
| `player` | current station, paused, volume, muted |
| `favorites` | favorite stations, sort order |
| `recent` | recently played stations |

### Design decisions worth a look

- **Only serializable data in Redux.** The `HTMLAudioElement` lives in a `useRef` inside the player bar and is synced with the store through effects. The bar is mounted at the root, so searching never interrupts playback.
- **Race conditions are handled at two levels.**
  - The previous search is cancelled with `abort()`; the signal is passed to `fetch`.
  - The reducer only accepts a response with the current `requestId`. "Load more" has its own `requestId`, so a page from an old search never mixes into a new one.
- **`condition` in thunks.** Country and genre lists load exactly once. "Load more" doesn't start twice, and doesn't start when there are no more results.
- **Slices react to other slices' actions.** `recent` listens to `player/playStation` via `extraReducers`, so the player knows nothing about history.
- **Side effects live in listener middleware.**
  - Writing to `localStorage` and updating the address bar are kept out of reducers.
  - Saving the volume is debounced with `cancelActiveListeners` + `delay`. The slider dispatches dozens of actions per second, and only the last one is written.
- **Memoized selectors.**
  - `selectVisibleFavorites` (`createSelector`) filters and sorts favorites, and returns the same array until its inputs change.
  - `selectFavoriteIds` returns a `Set`, so each card checks "is favorite" in O(1).
- **Resilience.**
  - Falls back across API mirrors.
  - Shows clear error messages.
  - Discards corrupted `localStorage` data.
  - Doesn't treat the browser's autoplay block as a stream error.
- **HTTP streams.** Browsers block insecure streams on an HTTPS site, so the "HTTPS only" filter is on by default there, and HTTP stations are marked.

## Running locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 64 tests: API, slices, selectors, UI scenarios
npm run lint
npm run build
```
