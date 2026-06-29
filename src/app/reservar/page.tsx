import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import ReservaFlow from './ReservaFlow'

export const metadata: Metadata = {
  title: 'Reservar cita',
  description: 'Agenda tu cita de maquillaje con Renata Belmonte en Ciudad Juárez. Servicio de novia, quinceañera, eventos y más.',
}

export default async function ReservarPage() {
  const supabase = await createClient()

  const [{ data: services }, { data: availability }, { data: blockedDates }] =
    await Promise.all([
      supabase
        .from('services')
        .select('id, slug, name, description, duration_minutes, price_mxn, category')
        .eq('is_active', true)
        .order('sort_order'),
      supabase
        .from('availability')
        .select('weekday'),
      supabase
        .from('blocked_dates')
        .select('start_date, end_date')
        // Solo traemos bloqueos futuros (optimización)
        .gte('end_date', new Date().toISOString().slice(0, 10)),
    ])

  const openWeekdays = (availability ?? []).map(a => a.weekday)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pt-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 py-16">
          {/* Encabezado */}
          <div className="mb-12">
            <p className="font-sans text-accent text-xs tracking-[0.3em] uppercase flex items-center gap-2 mb-3">
              <span>✦</span> Reservaciones
            </p>
            <h1 className="font-serif text-4xl lg:text-5xl text-ink mb-4">
              Agenda tu cita
            </h1>
            <p className="font-sans text-muted-foreground max-w-xl leading-relaxed">
              Selecciona el servicio, la fecha y el horario. Te confirmaremos por correo
              y WhatsApp una vez procesada tu solicitud. Sin pago en línea: el pago
              se realiza el día del servicio.
            </p>
          </div>

          <ReservaFlow
            services={services ?? []}
            openWeekdays={openWeekdays}
            blockedDates={blockedDates ?? []}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
