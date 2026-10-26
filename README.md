# Radio Browser — ночной эфир

Интернет-радио на React + TypeScript. Портфолио-проект: показывает Redux Toolkit и работу с чужим REST API через `fetch`. Своего бэкенда нет, станции берутся из открытого [Radio Browser API](https://www.radio-browser.info/).

## Возможности

- **Поиск по названию** с задержкой ввода; устаревшие запросы отменяются. Отдельно оформлены загрузка, ошибка (с повтором), пустой результат и список.
- **Плеер**: станция продолжает играть, пока ищешь другую. Внизу панель «сейчас играет» с паузой и громкостью.
- **Избранное** хранится в `localStorage` и не сбрасывается при новом поиске.
- Адаптивный интерфейс на Tailwind, доступный с клавиатуры и для скринридеров.

## Стек

React 19 · TypeScript (strict) · Redux Toolkit · Tailwind CSS 4 · Vite · Vitest + Testing Library

## Архитектура

```
src/
  api/radioBrowser.ts       fetch-клиент: зеркала API, нормализация ответа, ApiError
  app/store.ts              configureStore, listener middleware для localStorage
  app/hooks.ts              типизированные useAppDispatch / useAppSelector
  features/
    stations/               слайс поиска + createAsyncThunk, хук useStationSearch
    player/                 слайс плеера + панель NowPlayingBar (<audio> вне Redux)
    favorites/              слайс избранного + чтение/запись localStorage
  components/               презентационные компоненты
```

Три слайса:

| Слайс | Состояние |
|---|---|
| `player` | текущая станция, пауза, громкость |
| `stations` | запрос, результаты, статус `idle / loading / succeeded / failed`, ошибка, id актуального запроса |
| `favorites` | избранные станции |

Решения, на которые стоит обратить внимание:

- В Redux лежат только сериализуемые данные. `HTMLAudioElement` хранится в `useRef` и синхронизируется со стором через эффекты.
- Гонки запросов закрыты дважды: предыдущий thunk отменяется через `abort()` (signal уходит в `fetch`), а редьюсер принимает ответ только с актуальным `requestId`.
- Избранное сохраняется через `createListenerMiddleware`, слайс остаётся чистым. Битые данные в `localStorage` отбрасываются.

## Запуск

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # тесты
npm run lint
npm run build
```
