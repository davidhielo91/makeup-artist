import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatBookingDate, formatBookingTime, formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import BookingActions from './BookingActions'
import type { BookingStatus } from '@/types/database'

export const metadata: Metadata = { title: 'Citas' }

const STATUS_CONFIG: Record<BookingStatus, { label: string; cls: string }> = {
  pending:   { label: 'Pendiente',  cls: 'bg-amber-50  border-amber-200  text-amber-700' },
  confirmed: { label: 'Confirmada', cls: 'bg-green-50  border-green-200  text-green-700' },
  cancelled: { label: 'Cancelada',  cls: 'bg-red-50    border-red-200    text-red-700'   },
  completed: { label: 'Completada', cls: 'bg-gray-100  border-gray-200   text-gray-500'  },
}

const STATUS_TABS = [
  { value: 'pending',   label: 'Pendientes'  },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'completed', label: 'Completadas' },
  { value: 'cancelled', label: 'Canceladas'  },
  { value: 'all',       label: 'Todas'       },
]

interface Props {
  searchParams: Promise<{ status?: string; from?: string; to?: string }>
}

export default async function AdminPage({ searchParams }: Props) {
  const { status = 'pending', from, to } = await searchParams
  const supabase = await createClient()

  // Conteo de pendientes para el badge del header
  const { count: pendingCount } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Consulta principal con join al servicio
  let query = supabase
    .from('bookings')
    .select('*, service:services(name, price_mxn)')
    .order('starts_at', { ascending: false })

  if (status !== 'all') {
    query = query.eq('status', status as BookingStatus)
  }
  if (from) query = query.gte('starts_at', `${from}T00:00:00-06:00`)
  if (to)   query = query.lte('starts_at', `${to}T23:59:59-06:00`)

  const { data: bookings } = await query

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      {/* Encabezado */}
      <div className="flex items-baseline gap-3 mb-6">
        <h1 className="font-serif text-2xl text-ink">Citas</h1>
        {(pendingCount ?? 0) > 0 && (
          <span className="font-sans text-xs bg-amber-100 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full">
            {pendingCount} pendiente{pendingCount === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-6">

        {/* Tabs de estado */}
        <div className="flex items-center gap-0.5 border border-line rounded bg-white/60 p-1">
          {STATUS_TABS.map(tab => (
            <Link
              key={tab.value}
              href={`/admin?status=${tab.value}`}
              className={cn(
                'font-sans text-xs px-3 py-1.5 rounded transition-colors',
                status === tab.value
                  ? 'bg-ink text-cream'
                  : 'text-muted-foreground hover:text-ink hover:bg-white'
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Filtro de fechas */}
        <form method="GET" action="/admin" className="flex items-center gap-2">
          <input type="hidden" name="status" value={status} />
          <input
            type="date"
            name="from"
            defaultValue={from}
            className={dateCls}
            placeholder="Desde"
          />
          <span className="font-sans text-xs text-muted-foreground">—</span>
          <input
            type="date"
            name="to"
            defaultValue={to}
            className={dateCls}
            placeholder="Hasta"
          />
          <button
            type="submit"
            className="font-sans text-xs border border-line rounded px-3 py-1.5 bg-white/60 hover:bg-white transition-colors"
          >
            Filtrar
          </button>
          {(from || to) && (
            <Link
              href={`/admin?status=${status}`}
              className="font-sans text-xs text-accent hover:underline"
            >
              Limpiar
            </Link>
          )}
        </form>
      </div>

      {/* Tabla */}
      {!bookings || bookings.length === 0 ? (
        <div className="border border-line rounded bg-white/60 p-12 text-center">
          <p className="font-sans text-sm text-muted-foreground">
            No hay citas con el filtro seleccionado.
          </p>
        </div>
      ) : (
        <div className="border border-line rounded bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-[#F7F4EE]">
                <th className={thCls}>Estado</th>
                <th className={thCls}>Servicio</th>
                <th className={thCls}>Clienta</th>
                <th className={thCls}>Contacto</th>
                <th className={thCls}>Fecha / Hora</th>
                <th className={thCls}>Detalles</th>
                <th className={cn(thCls, 'text-right')}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => {
                const cfg = STATUS_CONFIG[b.status as BookingStatus] ?? STATUS_CONFIG.pending
                const svc = b.service as { name: string; price_mxn: number } | null
                return (
                  <tr
                    key={b.id}
                    className="border-b border-line last:border-0 hover:bg-[#F9F7F3] transition-colors"
                  >
                    {/* Estado */}
                    <td className={tdCls}>
                      <span className={cn('font-sans text-xs border rounded px-2 py-0.5', cfg.cls)}>
                        {cfg.label}
                      </span>
                    </td>

                    {/* Servicio */}
                    <td className={tdCls}>
                      <p className="font-sans text-xs font-medium text-ink leading-snug">
                        {svc?.name ?? '—'}
                      </p>
                      {svc && (
                        <p className="font-sans text-xs text-muted-foreground">
                          {formatPrice(svc.price_mxn)}
                        </p>
                      )}
                    </td>

                    {/* Clienta */}
                    <td className={tdCls}>
                      <p className="font-sans text-xs text-ink">{b.customer_name}</p>
                    </td>

                    {/* Contacto */}
                    <td className={tdCls}>
                      <p className="font-sans text-xs text-muted-foreground">{b.customer_email}</p>
                      <p className="font-sans text-xs text-muted-foreground">{b.customer_phone}</p>
                    </td>

                    {/* Fecha / Hora */}
                    <td className={tdCls}>
                      <p className="font-sans text-xs text-ink whitespace-nowrap">
                        {formatBookingDate(b.starts_at)}
                      </p>
                      <p className="font-sans text-xs text-muted-foreground">
                        {formatBookingTime(b.starts_at)} h
                      </p>
                    </td>

                    {/* Detalles */}
                    <td className={tdCls}>
                      <div className="space-y-0.5 min-w-[140px]">
                        {b.event_type && (
                          <p className="font-sans text-xs text-ink">{b.event_type}</p>
                        )}
                        {b.at_home && (
                          <p className="font-sans text-xs text-accent">A domicilio</p>
                        )}
                        {b.allergies && (
                          <p className="font-sans text-xs text-muted-foreground line-clamp-2">
                            ⚠ {b.allergies}
                          </p>
                        )}
                        {b.reference_notes && (
                          <p className="font-sans text-xs text-muted-foreground line-clamp-1 italic">
                            {b.reference_notes}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className={cn(tdCls, 'text-right')}>
                      <BookingActions booking={{ id: b.id, status: b.status }} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const thCls = 'font-sans text-xs text-muted-foreground font-medium text-left px-4 py-3'
const tdCls = 'px-4 py-3 align-top'
const dateCls =
  'font-sans text-xs border border-line rounded px-2 py-1.5 bg-white/60 text-ink ' +
  'focus:outline-none focus:border-accent transition-colors'
