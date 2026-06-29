'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── Autenticación ────────────────────────────────────────────────

export async function signIn(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const email    = (formData.get('email')    as string)?.trim()
  const password = (formData.get('password') as string)

  if (!email || !password) return { error: 'Correo y contraseña requeridos.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: 'Credenciales incorrectas. Intenta de nuevo.' }

  redirect('/admin')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

// ─── Citas ────────────────────────────────────────────────────────

export async function updateBookingStatus(id: string, status: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'No autorizado' }

  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)

  if (error) return { ok: false as const, error: error.message }

  revalidatePath('/admin')
  return { ok: true as const }
}

// ─── Bloqueos ─────────────────────────────────────────────────────

export async function createBlockedDate(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const startDate = (formData.get('start_date') as string)?.trim()
  const endDate   = (formData.get('end_date')   as string)?.trim()
  const reason    = (formData.get('reason')     as string)?.trim() || null

  if (!startDate || !endDate) return { ok: false, error: 'Las fechas de inicio y fin son requeridas.' }
  if (endDate < startDate)    return { ok: false, error: 'La fecha fin debe ser igual o posterior a la fecha inicio.' }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autorizado' }

  const { error } = await supabase
    .from('blocked_dates')
    .insert({ start_date: startDate, end_date: endDate, reason })

  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/bloqueos')
  return { ok: true }
}

export async function deleteBlockedDate(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'No autorizado' }

  const { error } = await supabase
    .from('blocked_dates')
    .delete()
    .eq('id', id)

  if (error) return { ok: false as const, error: error.message }

  revalidatePath('/admin/bloqueos')
  return { ok: true as const }
}

// ─── Servicios ────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function upsertService(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const id               = (formData.get('id')               as string)?.trim() || null
  const name             = (formData.get('name')             as string)?.trim()
  const description      = (formData.get('description')      as string)?.trim() || null
  const duration_minutes = parseInt(formData.get('duration_minutes') as string, 10)
  const price_mxn        = parseInt(formData.get('price_mxn')        as string, 10)
  const category         = (formData.get('category')         as string)?.trim() || null
  const sort_order       = parseInt(formData.get('sort_order') as string, 10) || 0

  if (!name)                                     return { ok: false, error: 'El nombre es requerido.' }
  if (!duration_minutes || isNaN(duration_minutes)) return { ok: false, error: 'La duración es requerida.' }
  if (!price_mxn || isNaN(price_mxn))            return { ok: false, error: 'El precio es requerido.' }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autorizado' }

  if (id) {
    const { error } = await supabase
      .from('services')
      .update({ name, description, duration_minutes, price_mxn, category, sort_order })
      .eq('id', id)

    if (error) return { ok: false, error: error.message }
  } else {
    const slug = slugify(name)
    const { error } = await supabase
      .from('services')
      .insert({ slug, name, description, duration_minutes, price_mxn, category, sort_order })

    if (error) return { ok: false, error: error.message }
  }

  revalidatePath('/admin/servicios')
  revalidatePath('/')
  return { ok: true }
}

export async function toggleServiceActive(id: string, isActive: boolean) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'No autorizado' }

  const { error } = await supabase
    .from('services')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) return { ok: false as const, error: error.message }

  revalidatePath('/admin/servicios')
  revalidatePath('/')
  return { ok: true as const }
}
