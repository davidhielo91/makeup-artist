import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center overflow-hidden bg-cream pt-16"
    >
      {/* Manchas de acuarela */}
      <div className="blob w-[500px] h-[500px] bg-[#E8A87C] opacity-20 top-[-80px] right-[-100px]" />
      <div className="blob w-[350px] h-[350px] bg-[#D4906B] opacity-15 bottom-[-60px] left-[-80px]" />
      <div className="blob w-[280px] h-[280px] bg-[#F0C98B] opacity-20 top-1/2 left-1/3" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-0 w-full">
        <div className="max-w-2xl">
          {/* Marcador editorial */}
          <p className="font-sans text-accent text-xs tracking-[0.3em] uppercase mb-6 flex items-center gap-2">
            <span>✦</span> Makeup Artist · Ciudad Juárez
          </p>

          {/* Titular serif grande — firma del estilo */}
          <h1 className="font-serif text-[clamp(3.5rem,8vw,6.5rem)] leading-[1.05] text-ink mb-8">
            Maquillaje<br />
            para los días<br />
            <em className="not-italic text-accent">que importan.</em>
          </h1>

          {/* Subtítulo */}
          <p className="font-sans text-muted-foreground text-lg leading-relaxed mb-10 max-w-xl">
            Más de 8 años creando acabados naturales y luminosos que duran de la
            mañana a la madrugada. Especialista en novias, quinceañeras y eventos
            en Ciudad Juárez.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent-hover text-cream font-sans rounded px-8 py-3 h-auto text-sm tracking-wide"
            >
              <Link href="#reservar">Reservar cita</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-accent text-accent hover:bg-accent hover:text-cream bg-transparent font-sans rounded px-8 py-3 h-auto text-sm tracking-wide"
            >
              <Link href="#portafolio">Ver portafolio</Link>
            </Button>
          </div>
        </div>

        {/* Firma script — "una sola vez" según el sistema de diseño */}
        <p
          className="font-script text-accent text-5xl absolute bottom-12 right-10 opacity-25 select-none hidden lg:block"
          aria-hidden
        >
          Renata
        </p>
      </div>
    </section>
  )
}
