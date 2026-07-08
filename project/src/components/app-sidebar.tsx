import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutGrid,
  BarChart3,
  Heart,
  GitCompare,
  Settings,
  Zap,
  MessageSquare,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const nav = [
  { label: 'Showcase', icon: LayoutGrid, href: '/' },
  { label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { label: 'Favorites', icon: Heart, href: '/favorites' },
  { label: 'Compare', icon: GitCompare, href: '/compare' },
  { label: 'Inquiries', icon: MessageSquare, href: '/inquiries' },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Zap className="size-4 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-mono text-sm font-bold tracking-tight text-sidebar-foreground">Luxify</span>
            <span className="text-[10px] text-sidebar-foreground/50 uppercase tracking-widest">Motorsports</span>
          </div>
        </div>
      </SidebarHeader>

      <Separator className="mx-2 mb-2 w-auto bg-sidebar-border" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map(({ label, icon: Icon, href }) => {
                const isActive =
                  href === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(href)

                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={label}
                      className={cn(
                        'transition-all duration-150',
                        isActive && 'font-medium'
                      )}
                    >
                      <NavLink to={href}>
                        <Icon className="size-4" />
                        <span>{label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="pb-4">
        <Separator className="mx-2 mb-2 w-auto bg-sidebar-border" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <NavLink to="/settings">
                <Settings className="size-4" />
                <span>Settings</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
