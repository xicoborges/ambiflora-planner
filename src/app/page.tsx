import Link from 'next/link'
import { Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[oklch(0.988_0.004_150)] relative overflow-hidden px-6">
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,oklch(0.86_0.07_150/0.35),transparent)] pointer-events-none" />

      <div className="relative text-center max-w-xs w-full">
        <div className="flex justify-center mb-7">
          <div className="h-20 w-20 rounded-3xl bg-primary shadow-xl shadow-primary/25 flex items-center justify-center">
            <Leaf className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Ambiflora</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Planeamento de equipas, obras e equipamentos
        </p>

        <Button
          nativeButton={false}
          render={<Link href="/login" />}
          size="lg"
          className="w-full text-base shadow-md shadow-primary/20"
        >
          Entrar na aplicação
        </Button>
      </div>

      <footer className="absolute bottom-6 text-xs text-slate-400">
        © {new Date().getFullYear()} Ambiflora
      </footer>
    </main>
  )
}
