// src/lib/auth/requireSuperAdminApi.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type GuardOk = { ok: true; userId: string };
type GuardFail = { ok: false; res: NextResponse };

function normalizeRole(x?: unknown) {
  return String(x ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function isAllowed(role?: unknown, roles?: unknown) {
  const r1 = normalizeRole(role);
  const list = Array.isArray(roles) ? roles.map(normalizeRole) : [];
  const set = new Set([r1, ...list]);

  return set.has("superadmin") || set.has("godmode") || set.has("god_mode") || set.has("super_admin");
}

export async function requireSuperAdminApi(): Promise<GuardOk | GuardFail> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return {
      ok: false,
      res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const meta: any = data.user.app_metadata ?? {};
  const role = meta.role;
  const roles = meta.roles;

  if (!isAllowed(role, roles)) {
    return {
      ok: false,
      res: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, userId: data.user.id };
}