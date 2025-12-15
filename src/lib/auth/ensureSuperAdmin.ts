// src/lib/auth/ensureSuperAdmin.ts
"use server";

import { supabaseServer } from "@/lib/supabase/server";

export type SuperAdminGate =
  | { ok: true; userId: string }
  | { ok: false; error: string };

function normalizeRoles(meta: any): string[] {
  const raw = meta?.roles ?? meta?.role ?? [];
  const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return arr.map((r) => String(r).toLowerCase()).filter(Boolean);
}

export async function ensureSuperAdmin(): Promise<SuperAdminGate> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();

  if (error) return { ok: false, error: error.message };
  const user = data.user;
  if (!user) return { ok: false, error: "Niet ingelogd." };

  const roles = normalizeRoles(user.app_metadata ?? {});
  const isSuper =
    roles.includes("super_admin") || roles.includes("superadmin");

  if (!isSuper) return { ok: false, error: "Geen toegang (super_admin vereist)." };

  return { ok: true, userId: user.id };
}