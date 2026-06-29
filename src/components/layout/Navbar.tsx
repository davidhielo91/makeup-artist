'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '#inicio',    label: 'Inicio' },
  { href: '#sobre-mi', label: 'Sobre mí' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#portafolio', label: 'Portafolio' },
  { href: '#reservar',  label: 'Reservar' },
]

const WA_URL = 'https://wa.me/526562184490'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-shadow duration-300',
        scrolled ? 'bg-cream shadow-sm' : 'bg-cream/95 backdrop-blur-sm'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Marca */}
        <Link href="#inicio" className="font-serif text-lg tracking-wide text-ink hover:text-accent transition-colors">
          Renata Belmonte
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-sans text-sm text-ink/70 hover:text-accent transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* WhatsApp + hamburger */}
        <div className="flex items-center gap-3">
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-sans text-accent border border-accent px-4 py-1.5 rounded hover:bg-accent hover:text-cream transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <button
            className="md:hidden p-2 text-ink"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menú"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Nav móvil */}
      {open && (
        <div className="md:hidden bg-cream border-t border-line px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-sans text-sm text-ink/70 hover:text-accent transition-colors"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-sans text-accent border border-accent px-4 py-2 rounded w-fit hover:bg-accent hover:text-cream transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      )}
    </header>
  )
}
