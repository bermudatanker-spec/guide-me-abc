import { NextResponse } from "next/server";
import { requireGodmode } from "@/lib/admin/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Plan = "free" | "starter" | "growth" | "pro";
type Status = "active" | "inactive";

export async function POST(req: Request) {
  const guard = requireGodmode(req);
  if (!guard.ok) return guard.res;

  try {
    const body = await req.json().catch(() => ({}));
    const businessId = String(body.businessId ?? "");
    const plan = String(body.plan ?? "free") as Plan;
    const status = String(body.status ?? "inactive") as Status;

    if (!businessId) {
      return NextResponse.json({ ok: false, error: "Missing businessId" }, { status: 400 });
    }

    const sb = supabaseAdmin();

    // ✅ vereist: unique index op subscriptions(business_id)
    const { error } = await sb
      .from("subscriptions")
      .upsert(
        { business_id: businessId, plan, status },
        { onConflict: "business_id" }
      );

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}