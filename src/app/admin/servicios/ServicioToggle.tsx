'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleServiceActive } from '@/actions/admin'
import { Eye, EyeOff } from 'lucide-react'

interface Props {
  id: string
  isActive: boolean
}

export default function ServicioToggle({ id, isActive }: Props) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    await toggleServiceActive(id, !isActive)
    router.refresh()
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={isActive ? 'Desactivar servicio' : 'Activar servicio'}
      className={`p-1.5 rounded transition-colors disabled:opacity-50 ${
        isActive
          ? 'text-green-600 hover:text-red-600 hover:bg-red-50'
          : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
      }`}
    >
      {isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    </button>
  )
}
