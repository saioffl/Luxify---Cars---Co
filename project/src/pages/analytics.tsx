import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts'
import { TrendingUp, Car, DollarSign, Eye, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/page-header'
import { useAnalytics } from '@/hooks/use-cars'
import { formatPrice, CATEGORY_LABELS } from '@/lib/helpers'

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

export function AnalyticsPage() {
  const { data, loading } = useAnalytics()

  const viewChartData = useMemo(() => {
    if (!data) return []
    return data.viewsByDay.map((d) => ({
      ...d,
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }))
  }, [data])

  const categoryData = useMemo(() => {
    if (!data) return []
    return data.byCategory.map((d) => ({
      name: CATEGORY_LABELS[d.category] ?? d.category,
      value: d.count,
    }))
  }, [data])

  return (
    <div className="flex flex-col">
      <PageHeader title="Analytics" description="30-day performance overview" />

      <div className="flex-1 overflow-auto p-4 md:p-6">
        {/* Stats row */}
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Total Views"
            value={loading ? null : data?.totalViews?.toLocaleString() ?? '0'}
            icon={Eye}
            change="+12%"
          />
          <StatCard
            label="Vehicles Listed"
            value={loading ? null : String(data?.totalCars ?? 0)}
            icon={Car}
            change="+2 this month"
          />
          <StatCard
            label="Total Catalog Value"
            value={loading ? null : formatPrice(data?.totalValue ?? 0)}
            icon={DollarSign}
            change="Across all models"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          {/* Views chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="size-4 text-muted-foreground" />
                Page Views — Last 30 Days
              </CardTitle>
              <CardDescription className="text-xs">Daily vehicle detail page visits</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-56 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={viewChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      interval={4}
                    />
                    <YAxis
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: 12,
                      }}
                      labelStyle={{ color: 'var(--foreground)' }}
                      itemStyle={{ color: 'var(--chart-1)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      fill="url(#viewsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Category distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Fleet by Category</CardTitle>
              <CardDescription className="text-xs">Inventory breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-56 w-full" />
              ) : (
                <div className="flex flex-col gap-4">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'var(--popover)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-1.5">
                    {categoryData.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span className="text-xs text-muted-foreground">{d.name}</span>
                        </div>
                        <span className="font-mono text-xs font-medium">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top viewed cars */}
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top Viewed Vehicles</CardTitle>
            <CardDescription className="text-xs">Most visited vehicle detail pages in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {(data?.topCars ?? []).map((car, i) => (
                  <Link
                    key={car.id}
                    to={`/cars/${car.id}`}
                    className="group flex items-center justify-between rounded-lg border border-border px-3 py-2.5 transition-colors hover:border-border/60 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-muted-foreground">#{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium">{car.make} {car.model}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="size-3" />
                        {car.views}
                      </div>
                      <ArrowRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* HP comparison bar chart */}
        {data && !loading && (
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Views by Category (Bar)</CardTitle>
              <CardDescription className="text-xs">Relative popularity across vehicle types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={categoryData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, change }: {
  label: string; value: string | null; icon: React.ElementType; change?: string
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            {value === null ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <p className="font-mono text-2xl font-bold">{value}</p>
            )}
            {change && <p className="text-xs text-muted-foreground">{change}</p>}
          </div>
          <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
