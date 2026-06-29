export type ServiceCategory = 'social' | 'novia' | 'add-on' | 'curso'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface Service {
  id: string
  slug: string
  name: string
  description: string | null
  duration_minutes: number
  price_mxn: number
  category: ServiceCategory | null
  image_path: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Booking {
  id: string
  service_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  starts_at: string
  ends_at: string
  status: BookingStatus
  event_type: string | null
  allergies: string | null
  reference_notes: string | null
  at_home: boolean
  created_at: string
  service?: Service
}

export interface Availability {
  id: string
  weekday: number
  opens_at: string
  closes_at: string
}

export interface BlockedDate {
  id: string
  start_date: string
  end_date: string
  reason: string | null
  created_at: string
}
