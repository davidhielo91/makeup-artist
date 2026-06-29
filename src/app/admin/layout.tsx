import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminNav from './AdminNav'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { template: '%s · Admin', default: 'Panel · Renata Belmonte' },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Segunda capa de seguridad (el middleware es la primera)
  if (!user) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-[#F0EDE6]">
      <AdminNav userEmail={user.email ?? ''} />
      <div className="pt-14">
        {children}
      </div>
    </div>
  )
}
