import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_GODMODE_TOKEN!;

function adminSupabase() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: Request) {
  const token = req.headers.get("x-admin-token");
  if (!token || token !== ADMIN_TOKEN) return unauthorized();

  const supabase = adminSupabase();

  // businesses
  const { data: businesses, error: bErr } = await supabase
    .from("businesses")
    .select("id, name")
    .order("name", { ascending: true });

  if (bErr) return NextResponse.json({ ok: false, error: bErr.message }, { status: 500 });

  const ids = (businesses ?? []).map((b) => b.id);

  // subscriptions los ophalen
  const { data: subs, error: sErr } = ids.length
    ? await supabase.from("subscriptions").select("id, business_id, plan, status").in("business_id", ids)
    : { data: [], error: null as any };

  if (sErr) return NextResponse.json({ ok: false, error: sErr.message }, { status: 500 });

  const map = new Map<string, any>();
  for (const s of subs ?? []) map.set(s.business_id, s);

  const out = (businesses ?? []).map((b: any) => {
    const s = map.get(b.id) ?? null;
    return {
      id: b.id,
      name: b.name ?? null,
      subscription: s
        ? {
            id: s.id,
            plan: String(s.plan ?? "free").toLowerCase(),
            status: String(s.status ?? "inactive").toLowerCase(),
          }
        : null,
    };
  });

  return NextResponse.json({ ok: true, businesses: out });
}