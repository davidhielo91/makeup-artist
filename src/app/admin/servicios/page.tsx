import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDuration } from '@/lib/format'
import { cn } from '@/lib/utils'
import ServicioDialog from './ServicioDialog'
import ServicioToggle from './ServicioToggle'
import type { Service } from '@/types/database'

export const metadata: Metadata = { title: 'Servicios' }

const CATEGORY_LABELS: Record<string, string> = {
  social:   'Social / Evento',
  novia:    'Novia / Boda',
  'add-on': 'Complemento',
  curso:    'Curso',
}

export default async function ServiciosPage() {
  const supabase = await createClient()
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="font-serif text-2xl text-ink">Catálogo de servicios</h1>
          <p className="font-sans text-xs text-muted-foreground mt-1">
            Los servicios inactivos no aparecen en la web pública ni en las reservas.
          </p>
        </div>
        <ServicioDialog />
      </div>

      {/* Tabla */}
      <div className="border border-line rounded bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-[#F7F4EE]">
              <th className={thCls}>Estado</th>
              <th className={thCls}>Nombre</th>
              <th className={thCls}>Categoría</th>
              <th className={thCls}>Duración</th>
              <th className={thCls}>Precio</th>
              <th className={thCls}>Orden</th>
              <th className={cn(thCls, 'text-right')}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(services ?? []).map(s => (
              <tr
                key={s.id}
                className={cn(
                  'border-b border-line last:border-0 transition-colors',
                  s.is_active ? 'hover:bg-[#F9F7F3]' : 'opacity-55 hover:opacity-70'
                )}
              >
                {/* Estado */}
                <td className={tdCls}>
                  <span
                    className={cn(
                      'font-sans text-xs border rounded px-2 py-0.5',
                      s.is_active
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    )}
                  >
                    {s.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>

                {/* Nombre */}
                <td className={tdCls}>
                  <p className="font-sans text-xs font-medium text-ink">{s.name}</p>
                  {s.description && (
                    <p className="font-sans text-xs text-muted-foreground line-clamp-1 max-w-xs">
                      {s.description}
                    </p>
                  )}
                </td>

                {/* Categoría */}
                <td className={tdCls}>
                  <p className="font-sans text-xs text-muted-foreground">
                    {CATEGORY_LABELS[s.category ?? ''] ?? s.category ?? '—'}
                  </p>
                </td>

                {/* Duración */}
                <td className={tdCls}>
                  <p className="font-sans text-xs text-ink">{formatDuration(s.duration_minutes)}</p>
                </td>

                {/* Precio */}
                <td className={tdCls}>
                  <p className="font-sans text-xs font-medium text-ink">{formatPrice(s.price_mxn)}</p>
                </td>

                {/* Orden */}
                <td className={tdCls}>
                  <p className="font-sans text-xs text-muted-foreground">{s.sort_order}</p>
                </td>

                {/* Acciones */}
                <td className={cn(tdCls, 'text-right')}>
                  <div className="flex items-center justify-end gap-1">
                    <ServicioDialog service={s as Service} />
                    <ServicioToggle id={s.id} isActive={s.is_active} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Nota sobre eliminación */}
      <p className="font-sans text-xs text-muted-foreground mt-4">
        ✦ Los servicios no se pueden eliminar para preservar el historial de citas.
        Usa el ícono de ojo para activar o desactivar.
      </p>
    </div>
  )
}

const thCls = 'font-sans text-xs text-muted-foreground font-medium text-left px-4 py-3'
const tdCls = 'px-4 py-3 align-top'
