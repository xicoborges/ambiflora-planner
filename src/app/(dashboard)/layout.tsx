import { Sidebar, MobileSidebar } from '@/components/layout/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { Leaf } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center h-14 border-b bg-white px-4 md:hidden sticky top-0 z-10 gap-3">
          <MobileSidebar />
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <Leaf className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm text-slate-900 tracking-tight">Ambiflora</span>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 bg-background">
          {children}
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  )
}
