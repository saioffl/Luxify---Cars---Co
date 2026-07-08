import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

export type Car = {
  id: string
  make: string
  model: string
  year: number
  price: number
  category: 'coupe' | 'sedan' | 'suv' | 'convertible' | 'hypercar' | 'sports'
  color: string
  color_hex: string
  horsepower: number | null
  torque: number | null
  top_speed_mph: number | null
  acceleration_0_60: number | null
  engine: string | null
  transmission: string | null
  drivetrain: string | null
  fuel_type: string | null
  weight_lbs: number | null
  range_miles: number | null
  seating_capacity: number | null
  description: string | null
  featured: boolean
  in_stock: boolean
  stock_count: number
  created_at: string
  car_images?: CarImage[]
}

export type CarImage = {
  id: string
  car_id: string
  url: string
  alt: string | null
  is_primary: boolean
  sort_order: number
}

export type Inquiry = {
  id: string
  car_id: string | null
  name: string
  email: string
  phone: string | null
  message: string | null
  inquiry_type: 'test_drive' | 'pricing' | 'general'
  status: 'pending' | 'contacted' | 'closed'
  created_at: string
}
