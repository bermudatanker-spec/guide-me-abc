import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import "@/lib/admin/admin-guard";

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

  return { ok: true as const, requesterId: data.user.id };
}

export async function POST(req: Request) {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return guard.res;

  const { userId, role } = (await req.json().catch(() => ({}))) as { userId?: string; role?: string };

  const safeRole = String(role ?? "").trim().toLowerCase();
  if (!userId || !safeRole) return json(400, { ok: false, error: "Missing userId/role" });

  // Veiligheid: voorkom dat je super_admin op jezelf togglet
  if (userId === guard.requesterId && safeRole === "super_admin") {
    return json(400, { ok: false, error: "You cannot toggle super_admin on yourself" });
  }

  const admin = adminSupabase();

  const { data: got, error: gErr } = await admin.auth.admin.getUserById(userId);
  if (gErr || !got?.user) return json(404, { ok: false, error: gErr?.message ?? "User not found" });

  const target = got.user;
  const currentRoles = normalizeRoles(target.app_metadata?.roles);

  const has = currentRoles.includes(safeRole);
  const nextRoles = has ? currentRoles.filter((r) => r !== safeRole) : [...currentRoles, safeRole];

  const nextAppMeta = {
    ...(target.app_metadata ?? {}),
    roles: nextRoles,
  };

  const { error: uErr } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: nextAppMeta,
  });

  if (uErr) return json(500, { ok: false, error: uErr.message });

  return json(200, { ok: true, userId, roles: nextRoles });
}