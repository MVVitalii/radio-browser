import { useAppSelector } from '../../app/hooks'
import { EmptyState } from '../../components/EmptyState'
import { HeartIcon } from '../../components/icons'
import { StationGrid } from '../../components/StationGrid'
import { selectFavorites } from './favoritesSlice'

export function FavoritesList() {
  const favorites = useAppSelector(selectFavorites)

  if (favorites.length === 0) {
    return (
      <EmptyState icon={<HeartIcon className="size-9" />} title="Пока пусто">
        <p>Нажмите на сердечко у станции — она появится здесь и сохранится между визитами.</p>
      </EmptyState>
    )
  }

  return (
    <div className="pt-8">
      <StationGrid stations={favorites} />
    </div>
  )
}
