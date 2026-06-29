'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteBlockedDate } from '@/actions/admin'
import { Trash2 } from 'lucide-react'

export default function BloqueoDeleteButton({ id }: { id: string }) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('¿Eliminar este bloqueo?')) return
    setLoading(true)
    await deleteBlockedDate(id)
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title="Eliminar bloqueo"
      className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/5 disabled:opacity-50 transition-colors"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
