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

type Plan = "free" | "starter" | "growth" | "pro";
type Status = "active" | "inactive";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("x-admin-token");
    if (!token || token !== GODMODE_TOKEN) return unauthorized();

    const supabase = adminSupabase();

    // businesses (jouw FK wijst naar public.businesses)
    const { data: businesses, error: bErr } = await supabase
      .from("businesses")
      .select("id, name, island, user_id, slug, created_at")
      .order("created_at", { ascending: false });

    if (bErr) {
      return NextResponse.json({ ok: false, error: bErr.message }, { status: 500 });
    }

    const ids = (businesses ?? []).map((b) => b.id);

    // subscriptions bijbehorend (1 per business door unique index)
    let subsMap = new Map<
      string,
      { id: string; plan: Plan; status: Status; business_id: string }
    >();

    if (ids.length) {
      const { data: subs, error: sErr } = await supabase
        .from("subscriptions")
        .select("id, business_id, plan, status")
        .in("business_id", ids);

      if (!sErr && subs) {
        for (const s of subs as any[]) {
          subsMap.set(s.business_id, {
            id: s.id,
            business_id: s.business_id,
            plan: (s.plan ?? "free") as Plan,
            status: ((s.status ?? "inactive") as Status),
          });
        }
      }
    }

    const out = (businesses ?? []).map((b: any) => {
      const sub = subsMap.get(b.id) ?? null;
      return {
        id: b.id,
        name: b.name ?? "—",
        island: b.island ?? null,
        user_id: b.user_id ?? null,
        slug: b.slug ?? null,
        created_at: b.created_at ?? null,
        subscription: sub
          ? { plan: sub.plan, status: sub.status }
          : { plan: "free" as Plan, status: "inactive" as Status }, // default als er nog geen record is
      };
    });

    return NextResponse.json({ ok: true, businesses: out });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Server error" }, { status: 500 });
  }
}