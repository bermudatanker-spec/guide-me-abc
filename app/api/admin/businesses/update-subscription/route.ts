import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GODMODE_TOKEN = process.env.NEXT_PUBLIC_GODMODE_TOKEN!;

if (!SUPABASE_URL) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
if (!SERVICE_ROLE_KEY) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
if (!GODMODE_TOKEN) throw new Error("Missing NEXT_PUBLIC_GODMODE_TOKEN");

function adminSupabase() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

const ALLOWED_PLANS = new Set(["free", "starter", "growth", "pro"]);
const ALLOWED_STATUS = new Set(["active", "inactive"]);

export async function POST(req: Request) {
  try {
    const token = req.headers.get("x-admin-token");
    if (!token || token !== GODMODE_TOKEN) return unauthorized();

    const body = await req.json().catch(() => ({}));

    const businessId = String(body.businessId ?? "");
    const plan = String(body.plan ?? "free").toLowerCase();
    const status = String(body.status ?? "inactive").toLowerCase();

    if (!businessId) {
      return NextResponse.json({ ok: false, error: "Missing businessId" }, { status: 400 });
    }
    if (!ALLOWED_PLANS.has(plan)) {
      return NextResponse.json({ ok: false, error: "Invalid plan" }, { status: 400 });
    }
    if (!ALLOWED_STATUS.has(status)) {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }

    const supabase = adminSupabase();

    // upsert per business_id (unique index)
    const { error } = await supabase
      .from("subscriptions")
      .upsert(
        {
          business_id: businessId,
          plan,
          status,
        },
        { onConflict: "business_id" },
      );

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Server error" }, { status: 500 });
  }
}