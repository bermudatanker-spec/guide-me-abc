import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

function unauthorized(msg = "Unauthorized") {
  return NextResponse.json({ ok: false, error: msg }, { status: 401 });
}

async function requireSuperAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) return { ok: false as const, res: unauthorized("Not logged in") };

  const roles = normalizeRoles(data.user.app_metadata?.roles);
  const isSuper = roles.includes("super_admin") || roles.includes("superadmin");

  if (!isSuper) return { ok: false as const, res: unauthorized("Super admin required") };

  return { ok: true as const, userId: data.user.id };
}

export async function GET() {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return guard.res;

  const admin = adminSupabase();

  // 1) haal alle auth users op
  const allUsers: any[] = [];
  let page = 1;
  const perPage = 200;

  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error("[godmode/users] listUsers error", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const batch = data?.users ?? [];
    allUsers.push(...batch);

    if (batch.length < perPage) break;
    page++;
    if (page > 50) break; // safety
  }

  const ids = allUsers.map((u) => u.id);

  // 2) optioneel: profiles
  let profileMap = new Map<string, { full_name: string | null; is_blocked: boolean; business_name: string | null }>();
  try {
    if (ids.length) {
      const { data: profiles } = await admin
        .from("profiles")
        .select("id, full_name, is_blocked, business_name")
        .in("id", ids);

      for (const p of (profiles ?? []) as any[]) {
        profileMap.set(p.id, {
          full_name: p.full_name ?? null,
          is_blocked: !!p.is_blocked,
          business_name: p.business_name ?? null,
        });
      }
    }
  } catch {
    // profiles bestaat niet -> ignore
  }

  // 3) map naar UI model
  const users = allUsers.map((u) => {
    const prof = profileMap.get(u.id);

    const fullNameFromAuth =
      (u.user_metadata?.full_name as string | undefined) ??
      (u.user_metadata?.name as string | undefined) ??
      null;

    return {
      id: u.id,
      email: u.email ?? null,
      full_name: prof?.full_name ?? fullNameFromAuth,
      roles: normalizeRoles(u.app_metadata?.roles),
      is_blocked: prof?.is_blocked ?? false,
      created_at: u.created_at ?? null,
      last_sign_in_at: u.last_sign_in_at ?? null,
      business_name: prof?.business_name ?? null,
    };
  });

  return NextResponse.json({ ok: true, users });
}