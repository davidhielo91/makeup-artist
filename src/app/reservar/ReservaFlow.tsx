'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatPrice, formatDuration, toDateString } from '@/lib/format'
import { getAvailableSlots, createBooking } from '@/actions/booking'
import { AlertCircle, Clock, CheckCircle } from 'lucide-react'

// ─── Tipos ────────────────────────────────────────────────────────

type ServicePreview = {
  id: string
  slug: string
  name: string
  description: string | null
  duration_minutes: number
  price_mxn: number
  category: string | null
}

interface Props {
  services: ServicePreview[]
  openWeekdays: number[]        // días abiertos: 0=Dom...6=Sáb
  blockedDates: { start_date: string; end_date: string }[]
}

// ─── Componente principal ─────────────────────────────────────────

export default function ReservaFlow({ services, openWeekdays, blockedDates }: Props) {
  const router = useRouter()

  // Estado del flujo
  const [selectedService, setSelectedService] = useState<ServicePreview | null>(null)
  const [selectedDate,    setSelectedDate]    = useState<Date | undefined>(undefined)
  const [selectedTime,    setSelectedTime]    = useState<string | null>(null)

  // Estado de slots
  const [slots,        setSlots]        = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [noSlots,      setNoSlots]      = useState(false)

  // Estado del formulario
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    eventType: '', allergies: '', referenceNotes: '',
    atHome: false,
  })

  // Estado de envío
  const [submitting,   setSubmitting]   = useState(false)
  const [submitError,  setSubmitError]  = useState<string | null>(null)
  const [slotTaken,    setSlotTaken]    = useState(false)

  // ── Helpers ────────────────────────────────────────────────────

  function isDisabledDay(date: Date): boolean {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) return true
    if (!openWeekdays.includes(date.getDay())) return true
    const ds = toDateString(date)
    return blockedDates.some(b => ds >= b.start_date && ds <= b.end_date)
  }

  async function loadSlots(service: ServicePreview, date: Date) {
    setLoadingSlots(true)
    setSlots([])
    setNoSlots(false)
    setSelectedTime(null)
    setSubmitError(null)
    setSlotTaken(false)

    const result = await getAvailableSlots(service.id, toDateString(date))
    setSlots(result.slots)
    setNoSlots(result.slots.length === 0)
    setLoadingSlots(false)
  }

  function handleServiceSelect(service: ServicePreview) {
    setSelectedService(service)
    setSelectedDate(undefined)
    setSelectedTime(null)
    setSlots([])
    setNoSlots(false)
    setSubmitError(null)
  }

  function handleDateSelect(date: Date | undefined) {
    setSelectedDate(date)
    setSelectedTime(null)
    setSlots([])
    setNoSlots(false)
    if (date && selectedService) loadSlots(selectedService, date)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedService || !selectedDate || !selectedTime) return

    setSubmitting(true)
    setSubmitError(null)
    setSlotTaken(false)

    const result = await createBooking({
      serviceId:      selectedService.id,
      date:           toDateString(selectedDate),
      time:           selectedTime,
      customerName:   form.name,
      customerEmail:  form.email,
      customerPhone:  form.phone,
      eventType:      form.eventType,
      allergies:      form.allergies,
      referenceNotes: form.referenceNotes,
      atHome:         form.atHome,
    })

    if (result.ok) {
      router.push(`/reservar/confirmacion?id=${result.bookingId}`)
      return
    }

    setSubmitError(result.message)

    // Condición de carrera: el slot fue tomado justo antes — refrescar slots
    if (result.code === 'SLOT_TAKEN') {
      setSlotTaken(true)
      setSelectedTime(null)
      await loadSlots(selectedService, selectedDate)
    }

    setSubmitting(false)
  }

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="space-y-14">

      {/* ── PASO 1: Servicio ──────────────────────────────────── */}
      <section>
        <StepHeader n="01" title="¿Qué servicio buscas?" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map(s => (
            <button
              key={s.id}
              onClick={() => handleServiceSelect(s)}
              className={cn(
                'text-left p-5 border rounded transition-all duration-200 group',
                selectedService?.id === s.id
                  ? 'border-accent bg-accent/5 shadow-sm'
                  : 'border-line bg-white/50 hover:border-accent/40 hover:bg-white/70'
              )}
            >
              <p className="font-sans text-[10px] tracking-widest uppercase text-muted-foreground mb-1">
                {formatDuration(s.duration_minutes)}
              </p>
              <p className="font-serif text-base text-ink mb-2 leading-snug">{s.name}</p>
              <p className="font-sans text-xs text-muted-foreground line-clamp-2 mb-4">
                {s.description}
              </p>
              <p className={cn(
                'font-serif text-xl transition-colors',
                selectedService?.id === s.id ? 'text-accent' : 'text-ink/70 group-hover:text-accent'
              )}>
                desde {formatPrice(s.price_mxn)}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* ── PASO 2: Fecha ─────────────────────────────────────── */}
      {selectedService && (
        <section>
          <StepHeader n="02" title="Elige una fecha" />
          <p className="font-sans text-xs text-muted-foreground mb-4">
            Horario: Mar–Sáb 9:00–19:00. Los domingos son solo para eventos con reserva previa.
          </p>
          <div className="inline-block border border-line rounded bg-white/60 p-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={isDisabledDay}
              className="font-sans"
            />
          </div>
        </section>
      )}

      {/* ── PASO 3: Horario ───────────────────────────────────── */}
      {selectedDate && (
        <section>
          <StepHeader n="03" title="Elige un horario" />

          {loadingSlots && (
            <p className="font-sans text-sm text-muted-foreground animate-pulse">
              Verificando disponibilidad…
            </p>
          )}

          {!loadingSlots && slots.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {slots.map(slot => (
                <button
                  key={slot}
                  onClick={() => { setSelectedTime(slot); setSubmitError(null); setSlotTaken(false) }}
                  className={cn(
                    'font-sans text-sm px-5 py-2 border rounded transition-colors',
                    selectedTime === slot
                      ? 'bg-accent text-cream border-accent'
                      : 'border-line bg-white/60 text-ink hover:border-accent/50 hover:bg-white'
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}

          {!loadingSlots && noSlots && (
            <div className="flex items-start gap-3 border border-line rounded p-4 bg-white/50 max-w-md">
              <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="font-sans text-sm text-muted-foreground">
                No hay horarios disponibles ese día. Por favor elige otra fecha.
              </p>
            </div>
          )}

          {slotTaken && (
            <div className="flex items-start gap-3 border border-destructive/40 rounded p-4 bg-destructive/5 max-w-md mt-3">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="font-sans text-sm text-destructive">{submitError}</p>
            </div>
          )}
        </section>
      )}

      {/* ── PASO 4: Datos personales + envío ─────────────────── */}
      {selectedTime && (
        <section>
          <StepHeader n="04" title="Tus datos" />

          <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
            {/* Campos obligatorios */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nombre completo *">
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Tu nombre"
                  className={inputCls}
                />
              </Field>
              <Field label="Teléfono *">
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+52 656 000 0000"
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Correo electrónico *">
              <input
                required
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="tu@correo.com"
                className={inputCls}
              />
            </Field>

            <Field label="Tipo de evento">
              <input
                value={form.eventType}
                onChange={e => setForm({ ...form, eventType: e.target.value })}
                placeholder="Boda, graduación, sesión de foto…"
                className={inputCls}
              />
            </Field>

            <Field label="Alergias o condiciones de piel">
              <textarea
                value={form.allergies}
                onChange={e => setForm({ ...form, allergies: e.target.value })}
                rows={2}
                placeholder="Si tienes alguna alergia o condición especial, indícala aquí"
                className={`${inputCls} resize-none`}
              />
            </Field>

            <Field label="Referencias o notas">
              <textarea
                value={form.referenceNotes}
                onChange={e => setForm({ ...form, referenceNotes: e.target.value })}
                rows={2}
                placeholder="Comparte el estilo que buscas, inspiración o cualquier nota especial"
                className={`${inputCls} resize-none`}
              />
            </Field>

            {/* At home checkbox */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.atHome}
                onChange={e => setForm({ ...form, atHome: e.target.checked })}
                className="h-4 w-4 rounded border-line accent-accent cursor-pointer"
              />
              <span className="font-sans text-sm text-ink">
                Quiero el servicio a domicilio{' '}
                <span className="text-muted-foreground">(+$300 dentro de la ciudad)</span>
              </span>
            </label>

            {/* Resumen de la cita */}
            <div className="border border-accent/20 bg-accent/5 rounded p-5 space-y-1.5">
              <p className="font-sans text-xs text-accent tracking-widest uppercase mb-2">
                Resumen de tu cita
              </p>
              <p className="font-serif text-base text-ink">{selectedService?.name}</p>
              <div className="flex items-center gap-1.5 text-sm font-sans text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {selectedDate?.toLocaleDateString('es-MX', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}{' '}
                a las {selectedTime} h
              </div>
              <p className="font-serif text-lg text-accent">
                {formatPrice(selectedService?.price_mxn ?? 0)}
                {form.atHome && ' + $300 domicilio'}
              </p>
              <p className="font-sans text-xs text-muted-foreground pt-1">
                Pago en efectivo o transferencia el día del servicio. Sin pago en línea.
              </p>
            </div>

            {/* Error genérico (no slot_taken) */}
            {submitError && !slotTaken && (
              <div className="flex items-start gap-3 border border-destructive/40 rounded p-4 bg-destructive/5">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="font-sans text-sm text-destructive">{submitError}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-accent hover:bg-accent-hover text-cream font-sans rounded py-3 h-auto text-sm tracking-wide transition-colors"
            >
              {submitting ? 'Procesando…' : 'Confirmar reserva'}
            </Button>
          </form>
        </section>
      )}
    </div>
  )
}

// ── Sub-componentes de UI ─────────────────────────────────────────

const inputCls =
  'w-full border border-line rounded px-3 py-2.5 text-sm font-sans bg-white/50 ' +
  'placeholder:text-muted-foreground/60 focus:outline-none focus:border-accent transition-colors'

function StepHeader({ n, title }: { n: string; title: string }) {
  return (
    <h2 className="font-serif text-2xl text-ink mb-6 flex items-baseline gap-3">
      <span className="font-sans text-accent text-sm font-medium">{n}</span>
      {title}
    </h2>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="font-sans text-xs text-ink/60">{label}</label>
      {children}
    </div>
  )
}
