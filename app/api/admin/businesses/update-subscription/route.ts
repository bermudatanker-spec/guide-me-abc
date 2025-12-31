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
    const plan = body?.plan as Plan | undefined;
    const status = body?.status as Status | undefined;

    if (!business_id) {
      return NextResponse.json({ ok: false, error: "Missing business_id" }, { status: 400 });
    }

    if (!plan && !status) {
      return NextResponse.json({ ok: false, error: "Nothing to update" }, { status: 400 });
    }

    const sb = supabaseAdmin();

    // moet bestaan
    const { data: existing } = await sb
      .from("subscriptions")
      .select("id")
      .eq("business_id", business_id)
      .maybeSingle();

    if (!existing?.id) {
      return NextResponse.json({ ok: false, error: "Subscription not found" }, { status: 404 });
    }

    const patch: any = {};
    if (plan) patch.plan = plan;
    if (status) patch.status = status;

    const { error } = await sb
      .from("subscriptions")
      .update(patch)
      .eq("business_id", business_id);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Server error" }, { status: 500 });
  }
}