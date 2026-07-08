import { useState, useEffect } from 'react'
import { MessageSquare, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/page-header'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { supabase, type Inquiry } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type InquiryWithCar = Inquiry & { cars?: { make: string; model: string } | null }

const STATUS_CONFIG = {
  pending: { label: 'Pending', icon: Clock, class: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  contacted: { label: 'Contacted', icon: CheckCircle2, class: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  closed: { label: 'Closed', icon: XCircle, class: 'text-muted-foreground bg-muted border-border' },
}

const TYPE_LABELS = {
  test_drive: 'Test Drive',
  pricing: 'Pricing',
  general: 'General',
}

export function InquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryWithCar[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchInquiries = async () => {
    const { data } = await supabase
      .from('inquiries')
      .select('*, cars(make, model)')
      .order('created_at', { ascending: false })
    setInquiries((data as InquiryWithCar[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchInquiries()
  }, [])

  const updateStatus = async (id: string, status: Inquiry['status']) => {
    setUpdatingId(id)
    await supabase.from('inquiries').update({ status }).eq('id', id)
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)))
    setUpdatingId(null)
  }

  const counts = {
    total: inquiries.length,
    pending: inquiries.filter((i) => i.status === 'pending').length,
    contacted: inquiries.filter((i) => i.status === 'contacted').length,
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Inquiries"
        description="Customer contact requests"
        badge={loading ? undefined : `${counts.total} total`}
      />

      <div className="flex-1 overflow-auto p-4 md:p-6">
        {/* Summary strip */}
        <div className="mb-4 flex gap-3">
          {[
            { label: 'Pending', value: counts.pending, color: 'text-amber-400' },
            { label: 'Contacted', value: counts.contacted, color: 'text-blue-400' },
            { label: 'Total', value: counts.total, color: 'text-foreground' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <span className={cn('font-mono text-lg font-bold', s.color)}>{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : inquiries.length === 0 ? (
          <Empty className="mt-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageSquare />
              </EmptyMedia>
              <EmptyTitle>No inquiries yet</EmptyTitle>
              <EmptyDescription>
                Inquiries submitted from vehicle detail pages will appear here.
              </EmptyDescription>
            </EmptyHeader>
            <Button asChild variant="outline" size="sm">
              <Link to="/">Browse Showcase</Link>
            </Button>
          </Empty>
        ) : (
          <div className="flex flex-col gap-2">
            {inquiries.map((inq) => {
              const status = STATUS_CONFIG[inq.status]
              const StatusIcon = status.icon
              return (
                <div
                  key={inq.id}
                  className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/70"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{inq.name}</p>
                        <span className="text-xs text-muted-foreground">{inq.email}</span>
                        {inq.phone && <span className="text-xs text-muted-foreground">{inq.phone}</span>}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn('flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium', status.class)}>
                          <StatusIcon className="size-3" />
                          {status.label}
                        </span>
                        <span className="rounded-md border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                          {TYPE_LABELS[inq.inquiry_type]}
                        </span>
                        {inq.cars && (
                          <Link
                            to={`/cars/${inq.car_id}`}
                            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                          >
                            {inq.cars.make} {inq.cars.model}
                            <ArrowRight className="size-2.5" />
                          </Link>
                        )}
                      </div>

                      {inq.message && (
                        <p className="text-xs text-muted-foreground line-clamp-2 max-w-xl">
                          {inq.message}
                        </p>
                      )}

                      <p className="text-[10px] text-muted-foreground/60">
                        {new Date(inq.created_at).toLocaleString()}
                      </p>
                    </div>

                    <Select
                      value={inq.status}
                      onValueChange={(v) => updateStatus(inq.id, v as Inquiry['status'])}
                      disabled={updatingId === inq.id}
                    >
                      <SelectTrigger className="h-7 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                        <SelectItem value="contacted" className="text-xs">Contacted</SelectItem>
                        <SelectItem value="closed" className="text-xs">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
