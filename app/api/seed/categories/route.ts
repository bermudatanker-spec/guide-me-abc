import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST() {
  const admin = supabaseAdmin()

  const rows = [
    { name: 'Restaurants', slug: 'restaurants' },
    { name: 'Shops', slug: 'shops' },
    { name: 'Services', slug: 'services' },
  ]

  // v2: gebruik upsert met onConflict + ignoreDuplicates
  const { error } = await admin
    .from('categories')
    .upsert(rows, { onConflict: 'slug', ignoreDuplicates: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  return NextResponse.json({ ok: true }, { status: 201 })
}