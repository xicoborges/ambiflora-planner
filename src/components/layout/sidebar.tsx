'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Wrench, MapPin, UsersRound, CalendarDays, BarChart3, Menu, Leaf, LogOut, UserCog, LayoutDashboard, Settings } from 'lucide-react'
import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { logout } from '@/lib/actions/auth'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calendario', label: 'Calendário', icon: CalendarDays },
  { href: '/trabalhadores', label: 'Trabalhadores', icon: Users },
  { href: '/responsaveis', label: 'Responsáveis', icon: UserCog },
  { href: '/equipamentos', label: 'Equipamentos', icon: Wrench },
  { href: '/obras', label: 'Obras', icon: MapPin },
  { href: '/equipas', label: 'Equipas', icon: UsersRound },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-0.5 px-3 py-2 flex-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-slate-600 hover:bg-primary/10 hover:text-primary'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 px-5 py-4 border-b border-border hover:bg-muted/30 transition-colors">
      <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
        <Leaf className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="leading-tight">
        <p className="font-bold text-sm text-slate-900 tracking-tight">Ambiflora</p>
        <p className="text-[11px] text-muted-foreground">Planeamento de Equipas</p>
      </div>
    </Link>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const [pending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => { await logout() })
  }

  return (
    <div className="flex flex-col h-full">
      <Brand />
      <NavLinks onNavigate={onNavigate} />
      <div className="px-3 py-3 border-t border-border space-y-1">
        <button
          onClick={handleLogout}
          disabled={pending}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {pending ? 'A sair...' : 'Sair'}
        </button>
        <p className="text-[11px] text-muted-foreground px-3">© {new Date().getFullYear()} Ambiflora</p>
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r bg-sidebar h-screen sticky top-0">
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
