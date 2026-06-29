import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createServiceClient } from '@/lib/supabase/server'
import { formatBookingDate, formatBookingTime, formatPrice } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { CheckCircle, MessageCircle, Calendar, Clock, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Reserva confirmada',
}

interface Props {
  searchParams: Promise<{ id?: string }>
}

export default async function ConfirmacionPage({ searchParams }: Props) {
  const { id } = await searchParams

  if (!id) notFound()

  // Usamos service role porque RLS impide que usuarios anon lean reservas.
  // La page es server-side: la service key nunca llega al cliente.
  const supabase = await createServiceClient()

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, service:services(name, duration_minutes, price_mxn)')
    .eq('id', id)
    .single()

  if (!booking) notFound()

  const service = booking.service as { name: string; duration_minutes: number; price_mxn: number }
  const fechaDisplay = formatBookingDate(booking.starts_at)
  const horaDisplay  = formatBookingTime(booking.starts_at)

  // Mensaje pre-rellenado para WhatsApp
  const waMessage = encodeURIComponent(
    `Hola Renata, acabo de reservar una cita:\n\n` +
    `📋 Servicio: ${service.name}\n` +
    `📅 Fecha: ${fechaDisplay}\n` +
    `⏰ Hora: ${horaDisplay} h\n\n` +
    `¿Me confirmas disponibilidad? 😊`
  )
  const waUrl = `https://wa.me/526562184490?text=${waMessage}`

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pt-16">
        <div className="max-w-2xl mx-auto px-6 lg:px-10 py-16">

          {/* Ícono de éxito */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <p className="font-sans text-accent text-xs tracking-[0.3em] uppercase mb-3">
              ✦ Solicitud recibida
            </p>
            <h1 className="font-serif text-4xl text-ink mb-3">
              ¡Casi listo!
            </h1>
            <p className="font-sans text-muted-foreground max-w-sm leading-relaxed">
              Tu reserva está en estado <strong className="text-ink">pendiente</strong>.
              Renata la revisará y te enviará confirmación por correo y WhatsApp a la brevedad.
            </p>
          </div>

          {/* Tarjeta resumen */}
          <div className="border border-line rounded bg-white/70 p-6 space-y-4 mb-8">
            <p className="font-sans text-xs text-accent tracking-widest uppercase">
              Resumen de tu cita
            </p>

            <div className="border-b border-line pb-4">
              <p className="font-serif text-xl text-ink">{service.name}</p>
              <p className="font-sans text-sm text-muted-foreground mt-1">
                desde {formatPrice(service.price_mxn)} MXN
              </p>
            </div>

            <ul className="space-y-3">
              <li className="flex items-center gap-3 font-sans text-sm text-ink">
                <Calendar className="h-4 w-4 text-accent flex-shrink-0" />
                {fechaDisplay}
              </li>
              <li className="flex items-center gap-3 font-sans text-sm text-ink">
                <Clock className="h-4 w-4 text-accent flex-shrink-0" />
                {horaDisplay} h
              </li>
              {booking.at_home && (
                <li className="flex items-center gap-3 font-sans text-sm text-ink">
                  <MapPin className="h-4 w-4 text-accent flex-shrink-0" />
                  Servicio a domicilio (+$300)
                </li>
              )}
            </ul>

            <div className="border-t border-line pt-4 space-y-1">
              <p className="font-sans text-xs text-muted-foreground">
                Nombre: <span className="text-ink">{booking.customer_name}</span>
              </p>
              <p className="font-sans text-xs text-muted-foreground">
                Correo: <span className="text-ink">{booking.customer_email}</span>
              </p>
              <p className="font-sans text-xs text-muted-foreground">
                Teléfono: <span className="text-ink">{booking.customer_phone}</span>
              </p>
              {booking.event_type && (
                <p className="font-sans text-xs text-muted-foreground">
                  Evento: <span className="text-ink">{booking.event_type}</span>
                </p>
              )}
            </div>

            <div className="bg-accent/5 border border-accent/20 rounded p-3">
              <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                <strong className="text-ink">Pago:</strong> en efectivo o transferencia el día del
                servicio. Sin pago en línea. Para bodas y eventos grandes, Renata te indicará el
                anticipo del 30% al confirmar la cita.
              </p>
            </div>
          </div>

          {/* CTA: WhatsApp para confirmar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              className="flex-1 bg-accent hover:bg-accent-hover text-cream font-sans rounded py-3 h-auto gap-2"
            >
              <a href={waUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                Confirmar por WhatsApp
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 border-accent text-accent hover:bg-accent hover:text-cream bg-transparent font-sans rounded py-3 h-auto"
            >
              <Link href="/">Volver al inicio</Link>
            </Button>
          </div>

          <p className="font-sans text-xs text-muted-foreground text-center mt-6 leading-relaxed">
            Si tienes dudas, escríbenos a{' '}
            <a href="mailto:hola@renatabelmonte.mx" className="text-accent hover:underline">
              hola@renatabelmonte.mx
            </a>
            {' '}o al{' '}
            <a href="https://wa.me/526562184490" className="text-accent hover:underline">
              +52 656 218 4490
            </a>
          </p>

        </div>
      </main>
      <Footer />
    </>
  )
}
