import Link from 'next/link'
import { Leaf, CalendarDays, Users, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'


export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50/60 flex flex-col">
      {/* Header */}

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="h-20 w-20 rounded-2xl bg-primary shadow-xl shadow-primary/30 flex items-center justify-center mb-8">
          <Leaf className="h-10 w-10 text-primary-foreground" />
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight mb-4">
          Ambiflora
        </h1>
        <p className="text-xl text-slate-500 max-w-md mb-10">
          Planeamento de equipas, obras e equipamentos — simples e eficiente.
        </p>

        <Button nativeButton={false} render={<Link href="/login" />} size="lg" className="px-10 text-base shadow-lg shadow-primary/25">
          Entrar na aplicação
        </Button>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl w-full text-left">
          {[
            { icon: CalendarDays, title: 'Calendário visual', desc: 'Visualiza e gere alocações por dia, manhã e tarde.' },
            { icon: Users, title: 'Gestão de equipas', desc: 'Cria equipas, adiciona membros e acompanha disponibilidade.' },
            { icon: MapPin, title: 'Controlo de obras', desc: 'Regista obras, clientes e acompanha o estado de cada projecto.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white/80 border border-border rounded-xl p-5 shadow-sm">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Icon className="h-4.5 w-4.5 text-primary" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-6 text-xs text-slate-400">
        © {new Date().getFullYear()} Ambiflora · Todos os direitos reservados
      </footer>
    </main>
  )
}
