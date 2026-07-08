import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { ShowcasePage } from '@/pages/showcase'
import { CarDetailPage } from '@/pages/car-detail'
import { AnalyticsPage } from '@/pages/analytics'
import { FavoritesPage } from '@/pages/favorites'
import { ComparePage } from '@/pages/compare'
import { InquiriesPage } from '@/pages/inquiries'
import { SettingsPage } from '@/pages/settings'
import { Toaster } from '@/components/ui/sonner'

export function App() {
  return (
    <BrowserRouter>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset className="min-h-svh overflow-hidden">
          <Routes>
            <Route path="/" element={<ShowcasePage />} />
            <Route path="/cars/:id" element={<CarDetailPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/inquiries" element={<InquiriesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
