import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ambiflora — Planeamento de Equipas',
    short_name: 'Ambiflora',
    description: 'Planeamento de equipas, obras e equipamentos',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#166534',
    theme_color: '#166534',
    icons: [
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
