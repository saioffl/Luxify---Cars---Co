import { useState } from 'react'
import { Heart, Gauge, Zap, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Car } from '@/lib/supabase'
import { formatPrice, CATEGORY_LABELS } from '@/lib/helpers'
import { cn } from '@/lib/utils'

type CarCardProps = {
  car: Car
  isFavorite?: boolean
  onFavoriteToggle?: (id: string) => void
  onCompareToggle?: (id: string) => void
  inCompare?: boolean
}

export function CarCard({ car, isFavorite, onFavoriteToggle, onCompareToggle, inCompare }: CarCardProps) {
  const [imgError, setImgError] = useState(false)
  const primaryImage = car.car_images?.find((i) => i.is_primary) ?? car.car_images?.[0]

  const fuelColors: Record<string, string> = {
    Electric: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    Hybrid: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    Gas: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-card hover:-translate-y-0.5 hover:border-border/80 hover:shadow-2xl hover:shadow-black/40">
      {/* Image area */}
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {primaryImage && !imgError ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.alt ?? `${car.make} ${car.model}`}
            onError={() => setImgError(true)}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <CarPlaceholder make={car.make} color={car.color_hex} />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            onFavoriteToggle?.(car.id)
          }}
          className={cn(
            'absolute right-3 top-3 flex size-8 items-center justify-center rounded-full border border-border/50 bg-black/40 backdrop-blur-sm transition-all duration-200 hover:scale-110',
            isFavorite && 'border-red-400/50 bg-red-500/20'
          )}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={cn('size-4 transition-colors', isFavorite ? 'fill-red-400 text-red-400' : 'text-white/70')}
          />
        </button>

        {/* Category badge */}
        <div className="absolute left-3 top-3">
          <span className="rounded-md border border-border/30 bg-black/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white/80 backdrop-blur-sm">
            {CATEGORY_LABELS[car.category]}
          </span>
        </div>

        {/* Fuel type */}
        {car.fuel_type && (
          <div className="absolute bottom-3 left-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-medium', fuelColors[car.fuel_type] ?? 'text-muted-foreground bg-muted')}>
              {car.fuel_type}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{car.make}</p>
            <h3 className="mt-0.5 text-base font-semibold leading-tight">{car.model}</h3>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">{car.year}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-base font-bold text-primary">{formatPrice(car.price)}</p>
            {!car.in_stock && (
              <Badge variant="outline" className="mt-1 text-[10px] text-muted-foreground">
                Sold Out
              </Badge>
            )}
          </div>
        </div>

        {/* Specs strip */}
        <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
          {car.horsepower && (
            <div className="flex items-center gap-1.5">
              <Gauge className="size-3 text-muted-foreground" />
              <span className="font-mono text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{car.horsepower}</span> hp
              </span>
            </div>
          )}
          {car.acceleration_0_60 && (
            <div className="flex items-center gap-1.5">
              <Zap className="size-3 text-muted-foreground" />
              <span className="font-mono text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{car.acceleration_0_60}s</span> 0-60
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 pt-1">
          {onCompareToggle && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                onCompareToggle(car.id)
              }}
              className={cn('h-7 flex-1 text-xs', inCompare && 'border-primary/50 bg-primary/10 text-primary')}
            >
              {inCompare ? 'In Compare' : 'Compare'}
            </Button>
          )}
          <Button asChild size="sm" className="h-7 flex-1 gap-1 text-xs">
            <Link to={`/cars/${car.id}`}>
              View <ArrowRight className="size-3" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export function CarCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-7 flex-1" />
          <Skeleton className="h-7 flex-1" />
        </div>
      </div>
    </div>
  )
}

function CarPlaceholder({ make, color }: { make: string; color: string }) {
  const initials = make.slice(0, 2).toUpperCase()
  return (
    <div className="flex size-full items-center justify-center" style={{ background: `linear-gradient(135deg, ${color}20, ${color}05)` }}>
      <div className="flex flex-col items-center gap-2 opacity-40">
        <div className="flex size-16 items-center justify-center rounded-full border border-border" style={{ color }}>
          <span className="font-mono text-xl font-bold">{initials}</span>
        </div>
      </div>
    </div>
  )
}
