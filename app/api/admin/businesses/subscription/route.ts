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

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return NextResponse.json(
        {
          error:
            "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY",
        },
        { status: 500 }
      );
    }

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const items = Array.isArray(body?.items) ? body.items : [body];

    for (const item of items) {
      const businessId = item?.businessId;
      const plan = item?.plan;
      const status = item?.status;

      if (!businessId) throw new Error("Missing businessId");
      if (!isPlan(plan)) throw new Error(`Invalid plan: ${plan}`);
      if (!isStatus(status)) throw new Error(`Invalid status: ${status}`);

      const { error } = await sb
        .from("subscriptions")
        .upsert(
          { business_id: businessId, plan, status },
          { onConflict: "business_id" }
        );

      if (error) throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 400 }
    );
  }
}