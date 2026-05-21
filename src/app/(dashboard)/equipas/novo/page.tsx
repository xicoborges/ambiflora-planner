import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { TeamForm } from '@/components/team-form'

export default function NovaEquipaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/equipas"
          className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted transition-colors text-slate-500 hover:text-slate-700">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nova Equipa</h1>
      </div>
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <TeamForm />
      </div>
    </div>
  )
}
