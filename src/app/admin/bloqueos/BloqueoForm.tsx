'use client'

import { useState, useTransition, useRef } from 'react'
import { createBlockedDate } from '@/actions/admin'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function BloqueoForm() {
  const [isPending, startTransition] = useTransition()
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const result = await createBlockedDate(null, formData)
      if (result.ok) {
        formRef.current?.reset()
        setSuccess(true)
        setTimeout(() => setSuccess(false), 4000)
      } else {
        setError(result.error ?? 'Error al crear el bloqueo.')
      }
    })
  }

  return (
    <div className="border border-line rounded bg-white/80 p-6">
      <h2 className="font-sans text-sm font-medium text-ink mb-4">Nuevo bloqueo</h2>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-sans text-xs text-ink/60">Fecha inicio *</label>
            <input
              name="start_date"
              type="date"
              required
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-sans text-xs text-ink/60">Fecha fin *</label>
            <input
              name="end_date"
              type="date"
              required
              className={inputCls}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-sans text-xs text-ink/60">Motivo (opcional)</label>
          <input
            name="reason"
            type="text"
            placeholder="Vacaciones, evento personal, mantenimiento…"
            className={inputCls}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive border border-destructive/30 bg-destructive/5 rounded p-3">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="font-sans text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-700 border border-green-200 bg-green-50 rounded p-3">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <p className="font-sans text-sm">Fechas bloqueadas correctamente.</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="bg-accent hover:bg-accent-hover disabled:opacity-60 text-cream font-sans text-sm rounded px-5 py-2 transition-colors"
        >
          {isPending ? 'Guardando…' : 'Bloquear fechas'}
        </button>
      </form>
    </div>
  )
}

const inputCls =
  'w-full border border-line rounded px-3 py-2 text-sm font-sans bg-white/60 ' +
  'focus:outline-none focus:border-accent transition-colors'
