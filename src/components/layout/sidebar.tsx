'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Wrench, MapPin, UsersRound, CalendarDays, BarChart3, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const navItems = [
  { href: '/calendario', label: 'Calendário', icon: CalendarDays },
  { href: '/trabalhadores', label: 'Trabalhadores', icon: Users },
  { href: '/equipamentos', label: 'Equipamentos', icon: Wrench },
  { href: '/obras', label: 'Obras', icon: MapPin },
  { href: '/equipas', label: 'Equipas', icon: UsersRound },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            pathname.startsWith(href)
              ? 'bg-green-700 text-white'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <div className="h-8 w-8 rounded-full bg-green-700 flex items-center justify-center">
          <span className="text-white text-xs font-bold">A</span>
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">Ambiflora</p>
          <p className="text-xs text-gray-500">Planeamento</p>
        </div>
      </div>
      <NavLinks onNavigate={onNavigate} />
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r bg-white h-screen sticky top-0">
      <SidebarContent />
    </aside>
  )
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-56 p-0">
        <SidebarContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
