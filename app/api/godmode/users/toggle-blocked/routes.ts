import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
if (!SERVICE_ROLE_KEY) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

function normalizeRoles(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((r) => String(r).toLowerCase()).filter(Boolean);
  if (typeof raw === "string") return [raw.toLowerCase()];
  return [];
}

function adminSupabase() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function json(status: number, body: any) {
  return NextResponse.json(body, { status });
}

async function requireSuperAdmin() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) return { ok: false as const, res: json(401, { ok: false, error: "Not logged in" }) };

  const roles = normalizeRoles(data.user.app_metadata?.roles);
  const isSuper = roles.includes("super_admin") || roles.includes("superadmin");
  if (!isSuper) return { ok: false as const, res: json(401, { ok: false, error: "Super admin required" }) };

  return { ok: true as const };
}

export async function POST(req: Request) {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return guard.res;

  const { userId } = (await req.json().catch(() => ({}))) as { userId?: string };
  if (!userId) return json(400, { ok: false, error: "Missing userId" });

  const admin = adminSupabase();

  // optioneel: voorkom block van super_admin
  const { data: got, error: gErr } = await admin.auth.admin.getUserById(userId);
  if (gErr || !got?.user) return json(404, { ok: false, error: gErr?.message ?? "User not found" });

  const roles = normalizeRoles(got.user.app_metadata?.roles);
  if (roles.includes("super_admin") || roles.includes("superadmin")) {
    return json(400, { ok: false, error: "Cannot block a super admin" });
  }

  // profiles.is_blocked togglen (profiles is optioneel)
  let current = false;
  try {
    const { data: prof } = await admin.from("profiles").select("is_blocked").eq("id", userId).maybeSingle();
    current = !!(prof as any)?.is_blocked;
  } catch {
    // profiles bestaat niet -> kan niet blocken zonder table
    return json(500, { ok: false, error: "profiles table missing (needed for block/unblock)" });
  }

  const next = !current;

  const { error: upErr } = await admin.from("profiles").upsert(
    { id: userId, is_blocked: next },
    { onConflict: "id" }
  );

  if (upErr) return json(500, { ok: false, error: upErr.message });

  return json(200, { ok: true, userId, is_blocked: next });
}