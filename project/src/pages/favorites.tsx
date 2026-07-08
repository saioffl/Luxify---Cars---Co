import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CarCard, CarCardSkeleton } from '@/components/car-card'
import { PageHeader } from '@/components/page-header'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { useFavorites } from '@/hooks/use-cars'
import { supabase, type Car } from '@/lib/supabase'
import { getSessionKey } from '@/lib/helpers'
import { Link } from 'react-router-dom'

export function FavoritesPage() {
  const { favoriteIds, toggle } = useFavorites()
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const sessionKey = getSessionKey()

  useEffect(() => {
    const fetchFavoriteCars = async () => {
      setLoading(true)
      const { data: favs } = await supabase
        .from('favorites')
        .select('car_id')
        .eq('session_key', sessionKey)

      if (!favs?.length) {
        setCars([])
        setLoading(false)
        return
      }

      const ids = favs.map((f) => f.car_id as string)
      const { data } = await supabase
        .from('cars')
        .select('*, car_images(*)')
        .in('id', ids)

      setCars((data as Car[]) ?? [])
      setLoading(false)
    }

    fetchFavoriteCars()
  }, [sessionKey, favoriteIds])

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Favorites"
        description="Your saved vehicles"
        badge={loading ? undefined : `${cars.length} saved`}
      />

      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <CarCardSkeleton key={i} />)}
          </div>
        ) : cars.length === 0 ? (
          <Empty className="mt-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Heart />
              </EmptyMedia>
              <EmptyTitle>No saved vehicles</EmptyTitle>
              <EmptyDescription>
                Browse the showcase and save vehicles you&apos;re interested in.
              </EmptyDescription>
            </EmptyHeader>
            <Button asChild variant="outline" size="sm">
              <Link to="/">Browse Showcase</Link>
            </Button>
          </Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                isFavorite={favoriteIds.has(car.id)}
                onFavoriteToggle={toggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
