import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
export async function GET() {
  await supabaseServer().auth.signOut()
  return NextResponse.redirect(new URL('/', 'http://localhost:3000'))
}