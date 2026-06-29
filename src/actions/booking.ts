'use server'

import { createClient } from '@/lib/supabase/server'
import { sendConfirmationToCustomer, sendNewBookingAlert } from '@/lib/email'

// Ciudad Juárez: CST = UTC-6 (Chihuahua observa horario de verano MDT = UTC-6 en verano,
// MST = UTC-7 en invierno). Usamos -06:00 como aproximación razonable para un
// proyecto de portafolio. En producción, usar una librería de timezone (date-fns-tz).
const TZ_OFFSET = '-06:00'

// ─── Tipos públicos ────────────────────────────────────────────────

export type SlotResult = {
  slots: string[]   // ['09:00', '10:00', ...]  hora local en 24h
  error: string | null
}

export type BookingInput = {
  serviceId: string
  date: string      // 'YYYY-MM-DD'
  time: string      // 'HH:MM' hora local Juárez
  customerName: string
  customerEmail: string
  customerPhone: string
  eventType: string
  allergies: string
  referenceNotes: string
  atHome: boolean
}

export type BookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; code: 'SLOT_TAKEN' | 'VALIDATION' | 'SERVER_ERROR'; message: string }

// ─── PARTE 1: Cálculo de slots disponibles ─────────────────────────

export async function getAvailableSlots(
  serviceId: string,
  dateStr: string   // 'YYYY-MM-DD'
): Promise<SlotResult> {
  const supabase = await createClient()

  // Calcular weekday desde componentes UTC para evitar desfases de zona horaria
  // en strings de solo-fecha. 0=domingo ... 6=sábado (igual que JS Date.getDay())
  const [y, m, d] = dateStr.split('-').map(Number)
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay()

  // 1. ¿Hay disponibilidad para ese día de la semana?
  const { data: avail } = await supabase
    .from('availability')
    .select('opens_at, closes_at')
    .eq('weekday', weekday)
    .single()

  if (!avail) return { slots: [], error: null }   // día cerrado

  // 2. ¿La fecha está bloqueada?
  const { data: blocked } = await supabase
    .from('blocked_dates')
    .select('id')
    .lte('start_date', dateStr)
    .gte('end_date', dateStr)
    .limit(1)

  if (blocked && blocked.length > 0) return { slots: [], error: null }   // fecha bloqueada

  // 3. Duración del servicio
  const { data: service } = await supabase
    .from('services')
    .select('duration_minutes')
    .eq('id', serviceId)
    .single()

  if (!service) return { slots: [], error: 'Servicio no encontrado' }

  const duration = service.duration_minutes

  // 4. Reservas existentes ese día (pending o confirmed)
  const startOfDay = `${dateStr}T00:00:00${TZ_OFFSET}`
  const endOfDay   = `${dateStr}T23:59:59${TZ_OFFSET}`

  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('starts_at, ends_at')
    .in('status', ['pending', 'confirmed'])
    .gte('starts_at', startOfDay)
    .lte('starts_at', endOfDay)

  // 5. Generar slots cada 60 minutos dentro del horario de trabajo
  const [openH, openM]   = avail.opens_at.split(':').map(Number)
  const [closeH, closeM] = avail.closes_at.split(':').map(Number)
  const openMin  = openH  * 60 + openM
  const closeMin = closeH * 60 + closeM

  const now = new Date()   // UTC actual para comparar con slots convertidos a UTC
  const availableSlots: string[] = []

  for (let slotMin = openMin; slotMin + duration <= closeMin; slotMin += 60) {
    const slotHour = Math.floor(slotMin / 60)
    const slotMins = slotMin % 60
    const timeStr  = `${String(slotHour).padStart(2, '0')}:${String(slotMins).padStart(2, '0')}`

    // Descarta slots ya pasados (convertimos a UTC con el offset de Juárez)
    const slotISO  = `${dateStr}T${timeStr}:00${TZ_OFFSET}`
    const slotDate = new Date(slotISO)
    if (slotDate <= now) continue

    // Descarta slots que se solapan con reservas existentes
    const slotEnd = new Date(slotDate.getTime() + duration * 60_000)
    const hasOverlap = (existingBookings ?? []).some(b => {
      const bStart = new Date(b.starts_at)
      const bEnd   = new Date(b.ends_at)
      // Solape: slot empieza antes de que la otra termine Y slot termina después de que la otra empieza
      return slotDate < bEnd && slotEnd > bStart
    })

    if (!hasOverlap) availableSlots.push(timeStr)
  }

  return { slots: availableSlots, error: null }
}

// ─── PARTE 2: Crear reserva ────────────────────────────────────────

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  // Validación en servidor
  if (!input.serviceId || !input.date || !input.time) {
    return { ok: false, code: 'VALIDATION', message: 'Faltan datos requeridos.' }
  }
  if (!input.customerName.trim() || !input.customerEmail.trim() || !input.customerPhone.trim()) {
    return { ok: false, code: 'VALIDATION', message: 'Nombre, correo y teléfono son obligatorios.' }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.customerEmail)) {
    return { ok: false, code: 'VALIDATION', message: 'El correo no es válido.' }
  }

  const supabase = await createClient()

  // Obtener duración para calcular ends_at (el trigger de BD también lo hará, pero
  // enviamos un valor válido para evitar violaciones de NOT NULL antes del trigger)
  const { data: service } = await supabase
    .from('services')
    .select('duration_minutes, name, price_mxn')
    .eq('id', input.serviceId)
    .single()

  if (!service) {
    return { ok: false, code: 'VALIDATION', message: 'Servicio no encontrado.' }
  }

  const startsAt    = `${input.date}T${input.time}:00${TZ_OFFSET}`
  const startsAtMs  = new Date(startsAt).getTime()
  const endsAt      = new Date(startsAtMs + service.duration_minutes * 60_000).toISOString()

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      service_id:      input.serviceId,
      customer_name:   input.customerName.trim(),
      customer_email:  input.customerEmail.trim().toLowerCase(),
      customer_phone:  input.customerPhone.trim(),
      starts_at:       startsAt,
      ends_at:         endsAt,   // El trigger recalcula, pero necesitamos valor válido NOT NULL
      status:          'pending',
      event_type:      input.eventType.trim()       || null,
      allergies:       input.allergies.trim()        || null,
      reference_notes: input.referenceNotes.trim()  || null,
      at_home:         input.atHome,
    })
    .select('id')
    .single()

  if (error) {
    // 23P01 = EXCLUSION_VIOLATION — otro usuario tomó ese slot segundos antes
    if (error.code === '23P01') {
      return {
        ok: false,
        code: 'SLOT_TAKEN',
        message: 'Ese horario se acaba de ocupar. Por favor elige otro.',
      }
    }
    console.error('[createBooking] error:', error)
    return { ok: false, code: 'SERVER_ERROR', message: 'Ocurrió un error. Por favor intenta de nuevo.' }
  }

  if (!booking?.id) {
    return { ok: false, code: 'SERVER_ERROR', message: 'Error al guardar la reserva.' }
  }

  // Enviar correos en paralelo. Si fallan, NO se cancela la reserva.
  const emailData = {
    id:             booking.id,
    customerName:   input.customerName.trim(),
    customerEmail:  input.customerEmail.trim().toLowerCase(),
    customerPhone:  input.customerPhone.trim(),
    startsAt,
    serviceName:    service.name,
    servicePrice:   service.price_mxn,
    atHome:         input.atHome,
    eventType:      input.eventType.trim()      || null,
    allergies:      input.allergies.trim()       || null,
    referenceNotes: input.referenceNotes.trim() || null,
  }

  await Promise.allSettled([
    sendConfirmationToCustomer(emailData),
    sendNewBookingAlert(emailData),
  ])

  return { ok: true, bookingId: booking.id }
}
