import { Settings, Moon, Sun, Monitor, Zap, Database, Globe } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

type ThemeOption = 'light' | 'dark' | 'system'

export function SettingsPage() {
  const { theme, setTheme } = useTheme()

  const themeOptions: { value: ThemeOption; label: string; icon: React.ElementType }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <div className="flex flex-col">
      <PageHeader title="Settings" description="Preferences & configuration" />

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mx-auto max-w-xl flex flex-col gap-4">
          {/* Appearance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Appearance</CardTitle>
              <CardDescription className="text-xs">Customize how the interface looks.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <p className="mb-2.5 text-xs text-muted-foreground">Theme</p>
                <div className="flex gap-2">
                  {themeOptions.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      className={cn(
                        'flex flex-1 flex-col items-center gap-2 rounded-lg border p-3 text-xs transition-colors',
                        theme === value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-border/70 hover:text-foreground'
                      )}
                    >
                      <Icon className="size-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Application</CardTitle>
              <CardDescription className="text-xs">Technical details about this application.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {[
                  { icon: Zap, label: 'Application', value: 'APEX Motorsports' },
                  { icon: Globe, label: 'Framework', value: 'React + Vite + TypeScript' },
                  { icon: Database, label: 'Database', value: 'Supabase (PostgreSQL)' },
                  { icon: Settings, label: 'UI Library', value: 'shadcn/ui + Tailwind CSS v4' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2.5">
                      <Icon className="size-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{label}</span>
                    </div>
                    <span className="font-mono text-xs">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Features</CardTitle>
              <CardDescription className="text-xs">Capabilities of this application.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Vehicle Catalog',
                  'Advanced Filtering',
                  'Side-by-Side Compare',
                  'Favorites (Persistent)',
                  'Analytics Dashboard',
                  'Inquiry Management',
                  'Dark Mode',
                  'Responsive Design',
                  'Real-time Data',
                ].map((f) => (
                  <Badge key={f} variant="outline" className="text-[10px] font-normal text-muted-foreground">
                    {f}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
