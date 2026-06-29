import Link from 'next/link'
import { MessageCircle, Mail, MapPin } from 'lucide-react'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  )
}

const servicios = [
  { href: '#servicios', label: 'Maquillaje Social / Evento' },
  { href: '#servicios', label: 'Maquillaje de Novia' },
  { href: '#servicios', label: 'Quinceañera' },
  { href: '#servicios', label: 'Peinado (add-on)' },
  { href: '#servicios', label: 'Curso personalizado' },
]

export default function Footer() {
  return (
    <footer className="bg-footer text-cream/80">
      {/* Tira de Instagram */}
      <div className="border-b border-white/10 py-10 text-center">
        <p className="font-sans text-cream/40 text-xs tracking-[0.3em] uppercase mb-2">Sígueme en</p>
        <a
          href="https://instagram.com/renata.mua"
          target="_blank"
          rel="noopener noreferrer"
          className="font-serif text-3xl lg:text-4xl text-cream hover:text-accent transition-colors inline-flex items-center gap-3"
        >
          <InstagramIcon className="h-7 w-7" />
          @renata.mua
        </a>
      </div>

      {/* Cuerpo principal */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid md:grid-cols-3 gap-12">

          {/* Columna 1: Marca */}
          <div>
            <p className="font-sans text-cream/30 text-[10px] tracking-[0.3em] uppercase mb-3">✦ Makeup Artist</p>
            <h3 className="font-serif text-2xl text-cream mb-4 leading-tight">
              Renata Belmonte
            </h3>
            <p className="font-sans text-sm text-cream/50 leading-relaxed">
              Maquillaje profesional para los días más importantes.
              Especialista en novia, quinceañera y evento en Ciudad Juárez.
            </p>
          </div>

          {/* Columna 2: Servicios */}
          <div>
            <p className="font-sans text-cream/30 text-[10px] tracking-[0.3em] uppercase mb-5">Servicios</p>
            <ul className="space-y-2.5">
              {servicios.map((s) => (
                <li key={s.label}>
                  <Link
                    href={s.href}
                    className="font-sans text-sm text-cream/60 hover:text-accent transition-colors"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div>
            <p className="font-sans text-cream/30 text-[10px] tracking-[0.3em] uppercase mb-5">Contacto</p>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://wa.me/526562184490"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 font-sans text-sm text-cream/60 hover:text-accent transition-colors"
                >
                  <MessageCircle className="h-4 w-4 flex-shrink-0" />
                  +52 656 218 4490
                </a>
              </li>
              <li>
                <a
                  href="mailto:hola@renatabelmonte.mx"
                  className="flex items-center gap-3 font-sans text-sm text-cream/60 hover:text-accent transition-colors"
                >
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  hola@renatabelmonte.mx
                </a>
              </li>
              <li>
                <p className="flex items-start gap-3 font-sans text-sm text-cream/60">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  Av. de las Torres 1450, Col. Campestre,<br />
                  Ciudad Juárez, Chih.
                </p>
              </li>
              <li className="font-sans text-xs text-cream/40 pt-2 leading-relaxed">
                Mar–Sáb 9:00–19:00<br />
                Dom solo eventos con reserva previa
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10 py-6 text-center">
        <p className="font-sans text-xs text-cream/25">
          © {new Date().getFullYear()} Renata Belmonte · Makeup Artist · Ciudad Juárez, México
        </p>
      </div>
    </footer>
  )
}
