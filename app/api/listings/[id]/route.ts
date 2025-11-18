// app/api/listings/[id]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/* ===========================
   GET – één listing ophalen
   =========================== */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // 👈 Promise eerst uitpakken

  const s = await supabaseServer();

  const { data, error } = await s
    .from("business_listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json(
      { error: "Listing not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}

/* ===========================
   PATCH – listing updaten
   =========================== */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

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

  const { data, error } = await s
    .from("business_listings")
    .update(body)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, data }, { status: 200 });
}

/* ===========================
   DELETE – listing verwijderen
   =========================== */
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const s = await supabaseServer();

  const { data: authData, error: authError } = await s.auth.getUser();
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const user = authData?.user;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await s
    .from("business_listings")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}