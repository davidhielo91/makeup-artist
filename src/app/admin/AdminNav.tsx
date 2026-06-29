'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/actions/admin'
import { cn } from '@/lib/utils'
import { LogOut } from 'lucide-react'

interface Props {
  userEmail: string
}

const NAV_LINKS = [
  { href: '/admin',           label: 'Citas'     },
  { href: '/admin/bloqueos',  label: 'Bloqueos'  },
  { href: '/admin/servicios', label: 'Servicios' },
]

export default function AdminNav({ userEmail }: Props) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 bg-ink border-b border-white/10 flex items-center px-5 gap-4">

      {/* Marca */}
      <Link href="/admin" className="font-serif text-cream/90 text-sm flex-shrink-0 hover:text-cream transition-colors">
        Renata Belmonte
      </Link>

      <div className="h-4 w-px bg-white/15 flex-shrink-0" />

      {/* Navegación */}
      <nav className="flex items-center gap-0.5">
        {NAV_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'font-sans text-xs px-3 py-1.5 rounded transition-colors',
              isActive(link.href)
                ? 'bg-accent text-cream'
                : 'text-cream/55 hover:text-cream hover:bg-white/10'
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Espaciador */}
      <div className="flex-1" />

      {/* Correo + botón de salida */}
      <div className="flex items-center gap-3">
        <span className="font-sans text-xs text-cream/40 hidden sm:block truncate max-w-[200px]">
          {userEmail}
        </span>
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-1.5 font-sans text-xs text-cream/55 hover:text-cream px-2 py-1.5 rounded hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Salir
          </button>
        </form>
      </div>

    </header>
  )
}
