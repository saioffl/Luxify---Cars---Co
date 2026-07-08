import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Heart, Share2, Gauge, Zap, Wind, Weight, Fuel,
  Users, Settings2, MessageSquare, CheckCircle2, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/page-header'
import { useCar, useFavorites } from '@/hooks/use-cars'
import { supabase } from '@/lib/supabase'
import { formatPrice, formatNumber, CATEGORY_LABELS } from '@/lib/helpers'
import { cn } from '@/lib/utils'

type InquiryType = 'test_drive' | 'pricing' | 'general'

export function CarDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { car, loading } = useCar(id)
  const { favoriteIds, toggle: toggleFavorite } = useFavorites()
  const [activeImg, setActiveImg] = useState(0)
  const [inquiryOpen, setInquiryOpen] = useState(false)

  if (loading) return <DetailSkeleton />

  if (!car) {
    return (
      <div className="flex flex-col">
        <PageHeader title="Vehicle Not Found" />
        <div className="flex flex-col items-center gap-4 pt-24">
          <p className="text-sm text-muted-foreground">This vehicle could not be found.</p>
          <Button asChild variant="outline" size="sm">
            <Link to="/">Back to Showcase</Link>
          </Button>
        </div>
      </div>
    )
  }

  const images = car.car_images ?? []
  const isFav = favoriteIds.has(car.id)

  const specs = [
    { label: 'Engine', value: car.engine, icon: Settings2 },
    { label: 'Horsepower', value: car.horsepower ? `${formatNumber(car.horsepower)} hp` : null, icon: Gauge },
    { label: 'Torque', value: car.torque ? `${formatNumber(car.torque)} lb-ft` : null, icon: Zap },
    { label: 'Top Speed', value: car.top_speed_mph ? `${car.top_speed_mph} mph` : null, icon: Wind },
    { label: '0–60 mph', value: car.acceleration_0_60 ? `${car.acceleration_0_60}s` : null, icon: Zap },
    { label: 'Transmission', value: car.transmission, icon: Settings2 },
    { label: 'Drivetrain', value: car.drivetrain, icon: Settings2 },
    { label: 'Fuel Type', value: car.fuel_type, icon: Fuel },
    { label: 'Weight', value: car.weight_lbs ? `${formatNumber(car.weight_lbs)} lbs` : null, icon: Weight },
    { label: 'Seating', value: car.seating_capacity ? `${car.seating_capacity} seats` : null, icon: Users },
    ...(car.range_miles ? [{ label: 'Range', value: `${car.range_miles} mi`, icon: Fuel }] : []),
  ].filter((s) => s.value)

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`${car.make} ${car.model}`}
        badge={CATEGORY_LABELS[car.category]}
        actions={
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
            <Link to="/">
              <ArrowLeft className="size-3.5" />
              Back
            </Link>
          </Button>
        }
      />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-4 md:p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            {/* Left: Images + description */}
            <div className="flex flex-col gap-4">
              {/* Main image */}
              <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted">
                {images.length > 0 ? (
                  <img
                    src={images[activeImg]?.url}
                    alt={images[activeImg]?.alt ?? car.model}
                    className="size-full object-cover transition-opacity duration-300"
                  />
                ) : (
                  <div
                    className="flex size-full items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${car.color_hex}30, ${car.color_hex}05)` }}
                  >
                    <span className="font-mono text-4xl font-bold opacity-20">
                      {car.make.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Color swatch overlay */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-lg border border-border/50 bg-black/60 px-2.5 py-1.5 backdrop-blur-sm">
                  <div className="size-3.5 rounded-full border border-white/20" style={{ background: car.color_hex }} />
                  <span className="text-[11px] text-white/80">{car.color}</span>
                </div>
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImg(i)}
                      className={cn(
                        'aspect-video w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                        i === activeImg ? 'border-primary' : 'border-border opacity-60 hover:opacity-100'
                      )}
                    >
                      <img src={img.url} alt={img.alt ?? ''} className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Description */}
              {car.description && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">About</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{car.description}</p>
                </div>
              )}

              {/* Specs grid */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Specifications</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5"
                    >
                      <span className="text-xs text-muted-foreground">{spec.label}</span>
                      <span className="font-mono text-xs font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Pricing + actions */}
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">{car.make}</p>
                    <h2 className="mt-1 text-2xl font-bold">{car.model}</h2>
                    <p className="font-mono text-sm text-muted-foreground">{car.year}</p>
                  </div>
                  <div
                    className="size-10 shrink-0 rounded-lg border border-border"
                    style={{ background: car.color_hex }}
                    title={car.color}
                  />
                </div>

                <Separator className="my-4" />

                <div>
                  <p className="text-xs text-muted-foreground">Starting MSRP</p>
                  <p className="font-mono text-3xl font-bold">{formatPrice(car.price)}</p>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {car.in_stock ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <CheckCircle2 className="size-3.5" />
                      {car.stock_count} Available
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3.5" />
                      Build to Order
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  <Button className="w-full gap-2" onClick={() => setInquiryOpen(true)}>
                    <MessageSquare className="size-4" />
                    Request Information
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn('gap-1.5', isFav && 'border-red-400/40 bg-red-500/10 text-red-400')}
                      onClick={() => toggleFavorite(car.id)}
                    >
                      <Heart className={cn('size-3.5', isFav && 'fill-red-400')} />
                      {isFav ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href)
                      }}
                    >
                      <Share2 className="size-3.5" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              {car.horsepower && (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'HP', value: car.horsepower, unit: 'hp' },
                    { label: '0–60', value: car.acceleration_0_60, unit: 's' },
                    { label: 'Top Speed', value: car.top_speed_mph, unit: 'mph' },
                    { label: 'Torque', value: car.torque, unit: 'lb-ft' },
                  ]
                    .filter((s) => s.value)
                    .map((s) => (
                      <div key={s.label} className="rounded-xl border border-border bg-card p-3 text-center">
                        <p className="font-mono text-lg font-bold">{s.value}</p>
                        <p className="text-[10px] text-muted-foreground">{s.unit}</p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <InquiryDialog open={inquiryOpen} onClose={() => setInquiryOpen(false)} carId={car.id} carName={`${car.make} ${car.model}`} />
    </div>
  )
}

function InquiryDialog({
  open, onClose, carId, carName,
}: { open: boolean; onClose: () => void; carId: string; carName: string }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', type: 'general' as InquiryType })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    await supabase.from('inquiries').insert({
      car_id: carId,
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      message: form.message || null,
      inquiry_type: form.type,
    })

    setSubmitting(false)
    setDone(true)
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => setDone(false), 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{done ? 'Inquiry Sent' : `Inquire About ${carName}`}</DialogTitle>
          <DialogDescription>
            {done
              ? 'Our team will reach out to you within 24 hours.'
              : 'Our specialists will reach out within 24 hours.'}
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="flex size-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
              <CheckCircle2 className="size-7 text-emerald-400" />
            </div>
            <Button onClick={handleClose} className="mt-2">
              Back to Vehicle
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-2">
            <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as InquiryType }))}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Inquiry</SelectItem>
                <SelectItem value="pricing">Pricing Details</SelectItem>
                <SelectItem value="test_drive">Schedule Test Drive</SelectItem>
              </SelectContent>
            </Select>
            <Input required placeholder="Full Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input required type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <Input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            <Textarea placeholder="Message (optional)" rows={3} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
            <Button type="submit" disabled={submitting} className="mt-1">
              {submitting ? 'Sending...' : 'Send Inquiry'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="flex h-14 items-center gap-3 border-b border-border px-4">
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="mx-auto max-w-6xl p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-4">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-72 w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
