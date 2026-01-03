import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdminApi";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Plan = "free" | "starter" | "growth" | "pro";
type Status = "active" | "inactive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // ✅ admin + super_admin
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.res;

  const supabase = await createSupabaseServerClient();

  // 🔥 CAST supabase zodat TS stopt met janken over views
  const { data, error } = await (supabase as any)
    .from("business_listings_with_subscription")
    .select(`
      business_id,
      business_name,
      island,
      subscription_plan,
      subscription_status
    `);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as any[];

  // ✅ DEDUPE: 1 business = 1 record (active wint)
  const map = new Map<string, any>();

  for (const row of rows) {
    const id = String(row.business_id ?? "").trim();
    if (!id) continue;

    const existing = map.get(id);

    const incomingStatus = String(row.subscription_status ?? "inactive");
    const existingStatus = String(existing?.subscription_status ?? "inactive");

    if (!existing) {
      map.set(id, row);
    } else if (existingStatus !== "active" && incomingStatus === "active") {
      map.set(id, row);
    }
  }

  const businesses = Array.from(map.values())
    .map((b: any) => ({
      id: String(b.business_id),
      name: String(b.business_name ?? ""),
      island: b.island ?? null,
      created_at: null,
      subscription: {
        plan: (b.subscription_plan ?? "free") as Plan,
        status: (b.subscription_status ?? "inactive") as Status,
      },
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ businesses });
}