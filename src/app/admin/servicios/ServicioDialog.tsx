'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { upsertService } from '@/actions/admin'
import { AlertCircle, Plus, Pencil } from 'lucide-react'
import type { Service } from '@/types/database'

interface Props {
  service?: Service
}

const CATEGORIES = [
  { value: '',        label: 'Sin categoría'       },
  { value: 'social',  label: 'Social / Evento'      },
  { value: 'novia',   label: 'Novia / Boda'         },
  { value: 'add-on',  label: 'Complemento (add-on)' },
  { value: 'curso',   label: 'Curso'                },
]

export default function ServicioDialog({ service }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (service) formData.set('id', service.id)

    setError(null)

    startTransition(async () => {
      const result = await upsertService(null, formData)
      if (result.ok) {
        setOpen(false)
        router.refresh()
      } else {
        setError(result.error ?? 'Error al guardar el servicio.')
      }
    })
  }

  // Cerrar el diálogo limpia el error
  function handleOpenChange(v: boolean) {
    setOpen(v)
    if (!v) setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {service ? (
          <button
            title="Editar servicio"
            className="p-1.5 rounded text-muted-foreground hover:text-ink hover:bg-black/5 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>
        ) : (
          <button className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-cream font-sans text-sm rounded px-4 py-2 transition-colors">
            <Plus className="h-4 w-4" />
            Nuevo servicio
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg text-ink">
            {service ? 'Editar servicio' : 'Nuevo servicio'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">

          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs text-ink/60">Nombre *</label>
            <input
              name="name"
              required
              defaultValue={service?.name}
              placeholder="Maquillaje de Novia"
              className={inputCls}
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs text-ink/60">Descripción</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={service?.description ?? ''}
              placeholder="Descripción breve del servicio"
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Duración + Precio */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-sans text-xs text-ink/60">Duración (min) *</label>
              <input
                name="duration_minutes"
                type="number"
                required
                min={1}
                defaultValue={service?.duration_minutes}
                placeholder="60"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-sans text-xs text-ink/60">Precio (MXN) *</label>
              <input
                name="price_mxn"
                type="number"
                required
                min={0}
                defaultValue={service?.price_mxn}
                placeholder="750"
                className={inputCls}
              />
            </div>
          </div>

          {/* Categoría + Orden */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-sans text-xs text-ink/60">Categoría</label>
              <select
                name="category"
                defaultValue={service?.category ?? ''}
                className={inputCls}
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-sans text-xs text-ink/60">Orden</label>
              <input
                name="sort_order"
                type="number"
                min={0}
                defaultValue={service?.sort_order ?? 0}
                placeholder="0"
                className={inputCls}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-destructive border border-destructive/30 bg-destructive/5 rounded p-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="font-sans text-sm">{error}</p>
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-line">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="font-sans text-sm text-muted-foreground hover:text-ink transition-colors px-4 py-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-accent hover:bg-accent-hover disabled:opacity-60 text-cream font-sans text-sm rounded px-5 py-2 transition-colors"
            >
              {isPending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}

const inputCls =
  'w-full border border-line rounded px-3 py-2 text-sm font-sans bg-white/60 ' +
  'focus:outline-none focus:border-accent transition-colors'
