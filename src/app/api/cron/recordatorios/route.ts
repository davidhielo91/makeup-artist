import { createServiceClient } from '@/lib/supabase/server'
import { sendReminderToCustomer, type BookingEmailData } from '@/lib/email'
import { NextResponse } from 'next/server'

/**
 * GET /api/cron/recordatorios
 *
 * Ejecutado diariamente por Vercel Cron (ver vercel.json).
 * Envía recordatorio a clientas con cita CONFIRMADA el día siguiente.
 * Protegido con CRON_SECRET para que solo Vercel pueda invocarlo.
 */
export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const supabase = await createServiceClient()

    // "Mañana" en zona horaria de Juárez (UTC-6)
    const now      = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const tmStr    = tomorrow.toISOString().slice(0, 10)

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*, service:services(name, price_mxn)')
      .eq('status', 'confirmed')
      .gte('starts_at', `${tmStr}T00:00:00-06:00`)
      .lte('starts_at', `${tmStr}T23:59:59-06:00`)

    if (error) throw error

    const results = await Promise.allSettled(
      (bookings ?? []).map(b => {
        const svc = b.service as { name: string; price_mxn: number } | null
        const emailData: BookingEmailData = {
          id:             b.id,
          customerName:   b.customer_name,
          customerEmail:  b.customer_email,
          customerPhone:  b.customer_phone,
          startsAt:       b.starts_at,
          serviceName:    svc?.name    ?? 'Servicio',
          servicePrice:   svc?.price_mxn ?? 0,
          atHome:         b.at_home,
          eventType:      b.event_type,
          allergies:      b.allergies,
          referenceNotes: b.reference_notes,
        }
        return sendReminderToCustomer(emailData)
      })
    )

    const sent   = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    console.log(`[cron/recordatorios] ${sent} enviados, ${failed} fallidos`)
    return NextResponse.json({ ok: true, sent, failed })
  } catch (e) {
    console.error('[cron/recordatorios] Error:', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
