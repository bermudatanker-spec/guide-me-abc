// app/api/admin/businesses/route.ts
import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/requireSuperAdminApi";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireSuperAdminApi();
  if (!guard.ok) return guard.res;

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("businesses")
    .select(
      `
      id,
      name,
      island,
      created_at,
      subscriptions:subscriptions (
        plan,
        status
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // subscriptions komt als array (0/1) bij 1-to-many; we normaliseren naar object|null
  const normalized = (data ?? []).map((b: any) => ({
    ...b,
    subscription: Array.isArray(b.subscriptions) ? b.subscriptions[0] ?? null : b.subscriptions ?? null,
    subscriptions: undefined,
  }));

  return NextResponse.json({ businesses: normalized });
}