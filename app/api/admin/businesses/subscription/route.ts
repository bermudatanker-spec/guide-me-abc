// app/api/admin/businesses/subscription/route.ts
import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/requireSuperAdminApi";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Plan = "free" | "starter" | "growth" | "pro";
type Status = "active" | "inactive";

const PLANS: Plan[] = ["free", "starter", "growth", "pro"];
const STATUSES: Status[] = ["active", "inactive"];

function norm(v: unknown) {
  return String(v ?? "").trim().toLowerCase();
}

export async function POST(req: Request) {
  const guard = await requireSuperAdminApi();
  if (!guard.ok) return guard.res;

  const supabase = await createSupabaseServerClient();

  try {
    const body = await req.json().catch(() => ({}));

    const businessId = String(body.businessId ?? "").trim();
    const plan = (norm(body.plan) || "free") as Plan;
    const status = (norm(body.status) || "inactive") as Status;

    if (!businessId) {
      return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
    }
    if (!PLANS.includes(plan)) {
      return NextResponse.json(
        { error: `Invalid plan (allowed: ${PLANS.join(", ")})` },
        { status: 400 }
      );
    }
    if (!STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status (allowed: ${STATUSES.join(", ")})` },
        { status: 400 }
      );
    }

    // ✅ (optioneel) hard check: bestaat business?
    const { data: b, error: berr } = await supabase
      .from("businesses")
      .select("id")
      .eq("id", businessId)
      .maybeSingle();

    if (berr) {
      return NextResponse.json({ error: berr.message }, { status: 500 });
    }
    if (!b?.id) {
      return NextResponse.json(
        { error: "Unknown businessId (not in public.businesses)" },
        { status: 400 }
      );
    }

    // ✅ SYNC punt: alles via RPC (db regelt upsert + sync naar listing/view)
    const { error: rpcErr } = await supabase.rpc("admin_set_subscription", {
      p_business_id: businessId,
      p_plan: plan,
      p_status: status,
    });

    if (rpcErr) {
      return NextResponse.json({ error: rpcErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, businessId, plan, status });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Bad request" },
      { status: 400 }
    );
  }
}