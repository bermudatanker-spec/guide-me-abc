import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { data, error } = await supabaseServer().from('business_listings').select('*').eq('id', params.id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ data })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { data, error } = await supabaseServer().from('business_listings').update(body).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { error } = await supabaseServer().from('business_listings').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}