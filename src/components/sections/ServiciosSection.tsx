import { createClient } from '@/lib/supabase/server'
import type { Service } from '@/types/database'
import { Clock } from 'lucide-react'

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(price)
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

const categoryLabel: Record<string, string> = {
  social: 'Social',
  novia: 'Novia',
  'add-on': 'Complemento',
  curso: 'Curso',
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group bg-white/60 border border-line rounded p-6 hover:border-accent/40 hover:shadow-sm transition-all duration-300">
      {/* Categoría */}
      {service.category && (
        <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
          {categoryLabel[service.category] ?? service.category}
        </span>
      )}

      {/* Nombre */}
      <h3 className="font-serif text-xl text-ink mt-2 mb-3 leading-snug">
        {service.name}
      </h3>

      {/* Descripción */}
      <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-5">
        {service.description}
      </p>

      {/* Línea guía: duración ··· precio */}
      <div className="flex items-end justify-between border-t border-line/60 pt-4 mt-auto">
        <span className="flex items-center gap-1 font-sans text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {formatDuration(service.duration_minutes)}
        </span>
        <span className="font-serif text-xl text-accent">
          desde {formatPrice(service.price_mxn)}
        </span>
      </div>
    </article>
  )
}

export default async function ServiciosSection() {
  const supabase = await createClient()
  const { data: services, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (error || !services?.length) {
    return null
  }

  return (
    <section id="servicios" className="bg-cream py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Encabezado */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-6">
          <div>
            <p className="font-sans text-accent text-xs tracking-[0.3em] uppercase flex items-center gap-2 mb-3">
              <span>✦</span> Servicios
            </p>
            <h2 className="font-serif text-4xl lg:text-5xl text-ink">
              ¿Qué servicio buscas?
            </h2>
          </div>
          <p className="font-sans text-sm text-muted-foreground max-w-xs leading-relaxed">
            Grupos de 4+ personas: cotización directa.
            Servicio a domicilio <span className="text-ink">+$300</span> dentro
            de la ciudad.
          </p>
        </div>

        {/* Grid de tarjetas — SSR, datos reales de BD */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* Nota de precios */}
        <p className="font-sans text-xs text-muted-foreground mt-8 text-center">
          El monto final se confirma al reservar según la complejidad del look.
          Pago en efectivo o transferencia el día del servicio.
        </p>
      </div>
    </section>
  )
}
