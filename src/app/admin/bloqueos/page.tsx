import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import BloqueoForm from './BloqueoForm'
import BloqueoDeleteButton from './BloqueoDeleteButton'
import type { BlockedDate } from '@/types/database'

export const metadata: Metadata = { title: 'Bloqueos' }

export default async function BloqueosPage() {
  const supabase = await createClient()
  const { data: blocked } = await supabase
    .from('blocked_dates')
    .select('*')
    .order('start_date', { ascending: true })

  const today = new Date().toISOString().slice(0, 10)
  const past    = (blocked ?? []).filter(b => b.end_date < today)
  const current = (blocked ?? []).filter(b => b.end_date >= today)

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="font-serif text-2xl text-ink mb-6">Fechas bloqueadas</h1>

      {/* Formulario de creación */}
      <BloqueoForm />

      {/* Bloqueos activos / futuros */}
      <div className="mt-8">
        <h2 className="font-sans text-xs text-muted-foreground tracking-widest uppercase mb-3">
          Activos y futuros
        </h2>

        {current.length === 0 ? (
          <div className="border border-line rounded bg-white/60 p-8 text-center">
            <p className="font-sans text-sm text-muted-foreground">No hay fechas bloqueadas próximas.</p>
          </div>
        ) : (
          <div className="border border-line rounded bg-white divide-y divide-line">
            {current.map(b => <BloqueoRow key={b.id} block={b} />)}
          </div>
        )}
      </div>

      {/* Bloqueos pasados */}
      {past.length > 0 && (
        <div className="mt-8">
          <h2 className="font-sans text-xs text-muted-foreground tracking-widest uppercase mb-3">
            Pasados
          </h2>
          <div className="border border-line rounded bg-white/40 divide-y divide-line opacity-60">
            {past.map(b => <BloqueoRow key={b.id} block={b} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function BloqueoRow({ block }: { block: BlockedDate }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 gap-4">
      <div className="min-w-0">
        <p className="font-sans text-sm text-ink">
          {new Date(block.start_date + 'T12:00:00').toLocaleDateString('es-MX', {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
          {block.start_date !== block.end_date && (
            <>
              {' — '}
              {new Date(block.end_date + 'T12:00:00').toLocaleDateString('es-MX', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </>
          )}
        </p>
        {block.reason && (
          <p className="font-sans text-xs text-muted-foreground mt-0.5">{block.reason}</p>
        )}
      </div>
      <BloqueoDeleteButton id={block.id} />
    </div>
  )
}
