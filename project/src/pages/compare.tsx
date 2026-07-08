import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { GitCompare, Plus, X, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/page-header'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { supabase, type Car } from '@/lib/supabase'
import { formatPrice, formatNumber, CATEGORY_LABELS } from '@/lib/helpers'
import { cn } from '@/lib/utils'

const SPEC_ROWS = [
  { key: 'price', label: 'Price', format: (v: unknown) => typeof v === 'number' ? formatPrice(v) : '—' },
  { key: 'year', label: 'Year', format: (v: unknown) => String(v ?? '—') },
  { key: 'category', label: 'Category', format: (v: unknown) => CATEGORY_LABELS[v as string] ?? String(v ?? '—') },
  { key: 'horsepower', label: 'Horsepower', format: (v: unknown) => v ? `${formatNumber(v as number)} hp` : '—' },
  { key: 'torque', label: 'Torque', format: (v: unknown) => v ? `${formatNumber(v as number)} lb-ft` : '—' },
  { key: 'acceleration_0_60', label: '0–60 mph', format: (v: unknown) => v ? `${v}s` : '—' },
  { key: 'top_speed_mph', label: 'Top Speed', format: (v: unknown) => v ? `${v} mph` : '—' },
  { key: 'engine', label: 'Engine', format: (v: unknown) => String(v ?? '—') },
  { key: 'transmission', label: 'Transmission', format: (v: unknown) => String(v ?? '—') },
  { key: 'drivetrain', label: 'Drivetrain', format: (v: unknown) => String(v ?? '—') },
  { key: 'fuel_type', label: 'Fuel Type', format: (v: unknown) => String(v ?? '—') },
  { key: 'weight_lbs', label: 'Curb Weight', format: (v: unknown) => v ? `${formatNumber(v as number)} lbs` : '—' },
  { key: 'seating_capacity', label: 'Seats', format: (v: unknown) => v ? `${v}` : '—' },
]

// Keys where higher value = better (green highlight)
const HIGHER_IS_BETTER = new Set(['horsepower', 'torque', 'top_speed_mph'])
// Keys where lower value = better (green highlight)
const LOWER_IS_BETTER = new Set(['acceleration_0_60', 'weight_lbs', 'price'])

export function ComparePage() {
  const [searchParams] = useSearchParams()
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)

  const idsParam = searchParams.get('ids')

  useEffect(() => {
    if (!idsParam) {
      setLoading(false)
      return
    }

    const ids = idsParam.split(',').filter(Boolean).slice(0, 3)
    supabase
      .from('cars')
      .select('*, car_images(*)')
      .in('id', ids)
      .then(({ data }) => {
        setCars((data as Car[]) ?? [])
        setLoading(false)
      })
  }, [idsParam])

  const removeCar = (id: string) => {
    const newIds = cars.filter((c) => c.id !== id).map((c) => c.id)
    const params = new URLSearchParams()
    if (newIds.length) params.set('ids', newIds.join(','))
    window.history.replaceState({}, '', `/compare?${params.toString()}`)
    setCars((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Compare"
        description="Side-by-side comparison"
        badge={cars.length > 0 ? `${cars.length} vehicles` : undefined}
      />

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-6">
            <Skeleton className="h-[500px] w-full rounded-xl" />
          </div>
        ) : cars.length === 0 ? (
          <Empty className="mt-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <GitCompare />
              </EmptyMedia>
              <EmptyTitle>No vehicles selected</EmptyTitle>
              <EmptyDescription>
                Go to the Showcase, select up to 3 vehicles, then click &ldquo;Compare Now&rdquo;.
              </EmptyDescription>
            </EmptyHeader>
            <Button asChild variant="outline" size="sm">
              <Link to="/">Browse Showcase</Link>
            </Button>
          </Empty>
        ) : (
          <div className="p-4 md:p-6">
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[600px] border-collapse">
                {/* Car headers */}
                <thead>
                  <tr>
                    <th className="w-36 border-b border-border bg-muted/30 px-4 py-3 text-left">
                      <span className="text-xs font-medium text-muted-foreground">Specification</span>
                    </th>
                    {cars.map((car) => (
                      <th key={car.id} className="border-b border-l border-border bg-muted/20 px-4 py-3 text-left">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{car.make}</p>
                            <p className="mt-0.5 text-sm font-semibold">{car.model}</p>
                            <p className="font-mono text-[10px] text-muted-foreground">{car.year}</p>
                          </div>
                          <button
                            onClick={() => removeCar(car.id)}
                            className="mt-0.5 text-muted-foreground transition-colors hover:text-foreground"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                        {/* Color swatch */}
                        <div className="mt-2 flex items-center gap-1.5">
                          <div className="size-3 rounded-full border border-border/50" style={{ background: car.color_hex }} />
                          <span className="text-[10px] text-muted-foreground">{car.color}</span>
                        </div>
                      </th>
                    ))}
                    {cars.length < 3 && (
                      <th className="border-b border-l border-border px-4 py-3">
                        <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                          <Link to="/">
                            <Plus className="size-3.5" />
                            Add Vehicle
                          </Link>
                        </Button>
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {SPEC_ROWS.map((row) => {
                    const values = cars.map((c) => c[row.key as keyof Car] as unknown)
                    const numericValues = values.map((v) => typeof v === 'number' ? v : null)
                    const hasNumeric = numericValues.some((v) => v !== null)

                    const getBestIndex = () => {
                      if (!hasNumeric) return -1
                      if (HIGHER_IS_BETTER.has(row.key)) {
                        const max = Math.max(...numericValues.filter((v): v is number => v !== null))
                        return numericValues.indexOf(max)
                      }
                      if (LOWER_IS_BETTER.has(row.key)) {
                        const min = Math.min(...numericValues.filter((v): v is number => v !== null))
                        return numericValues.indexOf(min)
                      }
                      return -1
                    }

                    const bestIndex = getBestIndex()

                    return (
                      <tr key={row.key} className="border-b border-border last:border-b-0 odd:bg-muted/10">
                        <td className="px-4 py-2.5">
                          <span className="text-xs text-muted-foreground">{row.label}</span>
                        </td>
                        {cars.map((car, i) => {
                          const val = car[row.key as keyof Car] as unknown
                          const isBest = bestIndex === i && val !== null
                          return (
                            <td key={car.id} className="border-l border-border px-4 py-2.5">
                              <div className="flex items-center gap-1.5">
                                <span className={cn('font-mono text-xs', isBest ? 'font-semibold text-emerald-400' : '')}>
                                  {row.format(val)}
                                </span>
                                {isBest && <CheckCircle2 className="size-3 text-emerald-400" />}
                              </div>
                            </td>
                          )
                        })}
                        {cars.length < 3 && <td className="border-l border-border" />}
                      </tr>
                    )
                  })}

                  {/* Action row */}
                  <tr>
                    <td className="px-4 py-3" />
                    {cars.map((car) => (
                      <td key={car.id} className="border-l border-border px-4 py-3">
                        <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                          <Link to={`/cars/${car.id}`}>
                            View Details
                            <ArrowRight className="size-3" />
                          </Link>
                        </Button>
                      </td>
                    ))}
                    {cars.length < 3 && <td className="border-l border-border" />}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
