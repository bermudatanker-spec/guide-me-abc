// app/api/listings/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/* ===========================
   GET – alle listings van user
   =========================== */
export async function GET(_req: Request) {
  const s = await supabaseServer();

  // huidige gebruiker ophalen
  const { data: authData, error: authError } = await s.auth.getUser();
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const user = authData?.user;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await s
    .from("business_listings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data }, { status: 200 });
}

/* ===========================
   POST – nieuwe listing maken
   =========================== */
export async function POST(req: Request) {
  const s = await supabaseServer();

  const { data: authData, error: authError } = await s.auth.getUser();
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const user = authData?.user;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // user_id altijd forceren op ingelogde user
  const payload = { ...body, user_id: user.id };

  const { data, error } = await s
    .from("business_listings")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, data }, { status: 201 });
}