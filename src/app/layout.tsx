import type { Metadata } from 'next'
import { Inter, Playfair_Display, Great_Vibes } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-script',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Renata Belmonte · Makeup Artist',
    template: '%s · Renata Belmonte',
  },
  description:
    'Maquillista profesional en Ciudad Juárez. Especialista en maquillaje de novia, quinceañeras y eventos. Reserva tu cita en línea.',
  keywords: ['maquillista', 'Ciudad Juárez', 'maquillaje novia', 'makeup artist', 'maquillaje evento'],
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://www.renatabelmonte.mx',
    siteName: 'Renata Belmonte · Makeup Artist',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={`${inter.variable} ${playfair.variable} ${greatVibes.variable}`}>
      <body>{children}</body>
    </html>
  )
}
