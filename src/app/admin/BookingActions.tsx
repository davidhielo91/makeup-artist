'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateBookingStatus } from '@/actions/admin'

interface Props {
  booking: { id: string; status: string }
}

export default function BookingActions({ booking }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleStatus(newStatus: string) {
    setLoading(newStatus)
    setError(null)
    const result = await updateBookingStatus(booking.id, newStatus)
    if (!result.ok) {
      setError('error' in result ? (result.error ?? 'Error') : 'Error')
      setLoading(null)
    } else {
      router.refresh()
    }
  }

  const { status } = booking

  if (status === 'cancelled' || status === 'completed') {
    return <span className="font-sans text-xs text-muted-foreground">—</span>
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      {error && <p className="font-sans text-[11px] text-destructive">{error}</p>}

      <div className="flex items-center gap-1.5">
        {status === 'pending' && (
          <button
            disabled={loading !== null}
            onClick={() => handleStatus('confirmed')}
            className="font-sans text-xs px-2.5 py-1 rounded border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {loading === 'confirmed' ? '…' : 'Confirmar'}
          </button>
        )}

        {status === 'confirmed' && (
          <button
            disabled={loading !== null}
            onClick={() => handleStatus('completed')}
            className="font-sans text-xs px-2.5 py-1 rounded border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {loading === 'completed' ? '…' : 'Completar'}
          </button>
        )}

        <button
          disabled={loading !== null}
          onClick={() => handleStatus('cancelled')}
          className="font-sans text-xs px-2.5 py-1 rounded border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {loading === 'cancelled' ? '…' : 'Cancelar'}
        </button>
      </div>
    </div>
  )
}
