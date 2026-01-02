// src/lib/auth/ensureSuperAdmin.ts
import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type Ok = { ok: true; userId: string };
type Fail = { ok: false; error: string };
export type EnsureResult = Ok | Fail;

function getRoles(user: any): string[] {
  const meta = user?.app_metadata ?? {};
  const raw = meta.roles ?? meta.role ?? user?.role ?? [];
  const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return arr.map((r) => String(r).trim().toLowerCase()).filter(Boolean);
}

function isSuperAdmin(user: any) {
  const roles = getRoles(user);
  return roles.includes("super_admin") || roles.includes("superadmin");
}

export async function ensureSuperAdmin(): Promise<EnsureResult> {
  const supabase: any = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) return { ok: false, error: error.message };
  const user = data?.user;
  if (!user) return { ok: false, error: "Niet ingelogd." };

  if (!isSuperAdmin(user)) {
    return { ok: false, error: "Geen toegang (super_admin vereist)." };
  }

  return { ok: true, userId: user.id };
}