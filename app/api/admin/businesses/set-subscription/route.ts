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
    const body = await req.json().catch(() => null);
    const business_id = body?.business_id as string | undefined;
    const plan = (body?.plan ?? "free") as Plan;
    const status = (body?.status ?? "inactive") as Status;

    if (!business_id) {
      return NextResponse.json({ ok: false, error: "Missing business_id" }, { status: 400 });
    }

    const sb = supabaseAdmin();

    // bestaat er al?
    const { data: existing } = await sb
      .from("subscriptions")
      .select("id")
      .eq("business_id", business_id)
      .maybeSingle();

    if (existing?.id) {
      return NextResponse.json({ ok: false, error: "Subscription already exists" }, { status: 409 });
    }

    const { error } = await sb
      .from("subscriptions")
      .insert({ business_id, plan, status });

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Server error" }, { status: 500 });
  }
}