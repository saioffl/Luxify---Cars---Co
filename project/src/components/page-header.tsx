import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ModeToggle } from '@/components/mode-toggle'
import { Badge } from '@/components/ui/badge'

type HeaderProps = {
  title: string
  description?: string
  badge?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, description, badge, actions }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
      <SidebarTrigger className="-ml-1 size-7 text-muted-foreground" />
      <Separator orientation="vertical" className="h-5" />
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <h1 className="truncate text-sm font-semibold">{title}</h1>
        {badge && (
          <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
            {badge}
          </Badge>
        )}
        {description && (
          <span className="hidden text-xs text-muted-foreground md:block">— {description}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <ModeToggle />
      </div>
    </header>
  )
}
