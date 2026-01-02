// app/api/admin/businesses/subscription/route.ts
import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/requireSuperAdminApi";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Plan = "free" | "starter" | "growth" | "pro";
type Status = "active" | "inactive";

const PLANS: Plan[] = ["free", "starter", "growth", "pro"];
const STATUSES: Status[] = ["active", "inactive"];

export async function POST(req: Request) {
  const guard = await requireSuperAdminApi();
  if (!guard.ok) return guard.res;

  const supabase = await createSupabaseServerClient();

  try {
    const body = await req.json();

    const businessId = String(body.businessId ?? "").trim();
    const plan = (String(body.plan ?? "free") as Plan) ?? "free";
    const status = (String(body.status ?? "inactive") as Status) ?? "inactive";

    if (!businessId) {
      return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
    }
    if (!PLANS.includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    if (!STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // ✅ HARD CHECK: bestaat business in public.businesses?
    const { data: b, error: berr } = await supabase
      .from("businesses")
      .select("id")
      .eq("id", businessId)
      .maybeSingle();

    if (berr) return NextResponse.json({ error: berr.message }, { status: 500 });
    if (!b?.id) {
      return NextResponse.json(
        { error: "Unknown businessId (not in public.businesses)" },
        { status: 400 }
      );
    }

    // ✅ Upsert subscription op business_id
    const { error: upErr } = await supabase
      .from("subscriptions")
      .upsert(
        { business_id: businessId, plan, status },
        { onConflict: "business_id" }
      );

    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Bad request" }, { status: 400 });
  }
}