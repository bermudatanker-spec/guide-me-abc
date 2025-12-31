import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import "@/lib/admin/admin-guard";

type Plan = "free" | "starter" | "growth" | "pro";
type Status = "active" | "inactive";

function isPlan(v: any): v is Plan {
  return v === "free" || v === "starter" || v === "growth" || v === "pro";
}
function isStatus(v: any): v is Status {
  return v === "active" || v === "inactive";
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GODMODE_TOKEN = process.env.GODMODE_TOKEN;

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

function adminSupabase() {
  if (!SUPABASE_URL) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!SERVICE_ROLE_KEY) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(req: Request) {
  try {
    if (!GODMODE_TOKEN) throw new Error("Missing GODMODE_TOKEN");

    const token = req.headers.get("x-admin-token");
    if (!token || token !== GODMODE_TOKEN) return unauthorized();

    const body = await req.json().catch(() => ({}));

    const businessId = body?.businessId ?? body?.business_id;
    const plan = body?.plan;
    const status = body?.status;

    if (!businessId) throw new Error("Missing businessId");
    if (!isPlan(plan)) throw new Error(`Invalid plan: ${plan}`);
    if (!isStatus(status)) throw new Error(`Invalid status: ${status}`);

    const supabase = adminSupabase();

    const { error } = await supabase
      .from("subscriptions")
      .upsert(
        { business_id: businessId, plan, status },
        { onConflict: "business_id" }
      );

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[update-subscription] error:", e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Server error" },
      { status: 400 }
    );
  }
}