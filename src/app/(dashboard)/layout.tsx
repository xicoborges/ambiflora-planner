import { Sidebar, MobileSidebar } from '@/components/layout/sidebar'
import { Toaster } from '@/components/ui/sonner'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center h-14 border-b bg-white px-4 md:hidden sticky top-0 z-10">
          <MobileSidebar />
          <span className="ml-2 font-semibold text-gray-800">Ambiflora</span>
        </header>
        <main className="flex-1 p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  )
}
