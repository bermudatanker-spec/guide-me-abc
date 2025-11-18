export type Island = 'aruba' | 'bonaire' | 'curacao'
export type ListingStatus = 'pending' | 'active' | 'inactive'
export type Plan = 'starter' | 'growth' | 'pro'

export interface Category {
  id: number
  name: string
  slug: string
  created_at: string
}

export interface BusinessListing {
  id: string
  user_id: string
  business_name: string
  category_id: number
  island: Island
  description: string | null
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  whatsapp: string | null
  logo_url: string | null
  cover_image_url: string | null
  status: ListingStatus
  subscription_plan: Plan
  created_at: string
  updated_at: string
}