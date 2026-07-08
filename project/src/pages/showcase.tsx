import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { CarCard, CarCardSkeleton } from '@/components/car-card'
import { PageHeader } from '@/components/page-header'
import { useCars, useFavorites } from '@/hooks/use-cars'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { CATEGORY_LABELS } from '@/lib/helpers'
import { formatPrice } from '@/lib/helpers'
import { cn } from '@/lib/utils'

const MAKES = ['Lamborghini', 'Ferrari', 'Porsche', 'McLaren', 'Bugatti', 'Rolls-Royce', 'Bentley', 'Aston Martin']
const FUEL_TYPES = ['Gas', 'Electric', 'Hybrid']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'hp_desc', label: 'Most Powerful' },
]

type SortKey = 'newest' | 'price_asc' | 'price_desc' | 'hp_desc'

export function ShowcasePage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('')
  const [make, setMake] = useState<string>('')
  const [fuel, setFuel] = useState<string>('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 4000000])
  const [sortBy, setSortBy] = useState<SortKey>('newest')
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set())

  const filters = useMemo(
    () => ({
      search: search || undefined,
      category: category || undefined,
      make: make || undefined,
      fuel_type: fuel || undefined,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 4000000 ? priceRange[1] : undefined,
      sortBy,
    }),
    [search, category, make, fuel, priceRange, sortBy]
  )

  const { cars, loading } = useCars(filters)
  const { favoriteIds, toggle: toggleFavorite } = useFavorites()

  const activeFilterCount = [category, make, fuel, priceRange[0] > 0 || priceRange[1] < 4000000].filter(Boolean).length

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < 3) {
        next.add(id)
      }
      return next
    })
  }

  const clearFilters = () => {
    setCategory('')
    setMake('')
    setFuel('')
    setPriceRange([0, 4000000])
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Showcase"
        description="Curated luxury & performance vehicles"
        badge={loading ? undefined : `${cars.length} cars`}
      />

      <div className="flex-1 overflow-auto">
        {/* Filter bar */}
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-2 p-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search make or model..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-sm"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <X className="size-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
              <SelectTrigger className="h-8 w-44 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="text-xs">
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category pills */}
            <div className="hidden items-center gap-1.5 md:flex">
              <Separator orientation="vertical" className="h-5" />
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setCategory(category === key ? '' : key)}
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors',
                    category === key
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-border/80 hover:text-foreground'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  <SlidersHorizontal className="size-3.5" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-0.5 h-4 min-w-4 rounded-full px-1 text-[10px]">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="text-sm font-semibold">Filter Vehicles</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-6">
                  <FilterSection label="Brand">
                    <div className="flex flex-wrap gap-1.5">
                      {MAKES.map((m) => (
                        <button
                          key={m}
                          onClick={() => setMake(make === m ? '' : m)}
                          className={cn(
                            'rounded-md border px-2 py-1 text-xs transition-colors',
                            make === m
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border text-muted-foreground hover:border-border/60 hover:text-foreground'
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </FilterSection>

                  <FilterSection label="Fuel Type">
                    <div className="flex gap-1.5">
                      {FUEL_TYPES.map((f) => (
                        <button
                          key={f}
                          onClick={() => setFuel(fuel === f ? '' : f)}
                          className={cn(
                            'rounded-md border px-3 py-1 text-xs transition-colors',
                            fuel === f
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border text-muted-foreground hover:text-foreground'
                          )}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </FilterSection>

                  <FilterSection label={`Price Range — ${formatPrice(priceRange[0])} – ${formatPrice(priceRange[1])}`}>
                    <Slider
                      min={0}
                      max={4000000}
                      step={10000}
                      value={priceRange}
                      onValueChange={(v) => setPriceRange(v as [number, number])}
                      className="mt-2"
                    />
                  </FilterSection>

                  {activeFilterCount > 0 && (
                    <Button variant="outline" size="sm" onClick={clearFilters} className="gap-1.5 text-xs">
                      <X className="size-3.5" />
                      Clear all filters
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Grid */}
        <div className="p-4">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <CarCardSkeleton key={i} />
              ))}
            </div>
          ) : cars.length === 0 ? (
            <Empty className="mt-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Sparkles />
                </EmptyMedia>
                <EmptyTitle>No vehicles found</EmptyTitle>
                <EmptyDescription>
                  Try adjusting your filters or search query.
                </EmptyDescription>
              </EmptyHeader>
              {activeFilterCount > 0 && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cars.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  isFavorite={favoriteIds.has(car.id)}
                  onFavoriteToggle={toggleFavorite}
                  onCompareToggle={toggleCompare}
                  inCompare={compareIds.has(car.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Compare bar */}
      {compareIds.size > 0 && (
        <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-border bg-popover px-4 py-2.5 shadow-2xl shadow-black/50 backdrop-blur-sm">
          <span className="font-mono text-xs text-muted-foreground">
            {compareIds.size} / 3 selected
          </span>
          <Separator orientation="vertical" className="h-4" />
          <Button
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() => {
              window.location.href = `/compare?ids=${[...compareIds].join(',')}`
            }}
          >
            Compare Now
          </Button>
          <button onClick={() => setCompareIds(new Set())} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}
