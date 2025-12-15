// src/lib/auth/get-role-flags.ts
import type { User } from "@supabase/supabase-js";

export type Role = "super_admin" | "admin" | "business_owner" | "user";

function normalizeRoles(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((r) => String(r).toLowerCase().trim()).filter(Boolean);
  }
  if (typeof raw === "string") {
    return [raw.toLowerCase().trim()];
  }
  return [];
}

export function getRoleFlags(user: User | null) {
  const meta: any = user?.app_metadata ?? {};

  // Supabase kan roles (array) of role (string) hebben
  const rolesRaw = meta.roles ?? meta.role ?? [];

  // Normaliseer + de-dupe
  const roles = Array.from(new Set(normalizeRoles(rolesRaw)));

  const isSuperAdmin = roles.includes("super_admin") || roles.includes("superadmin");

  // super_admin overruled: super_admin = altijd admin
  const isAdmin = isSuperAdmin || roles.includes("admin") || roles.includes("moderator");

  // jouw “owner” is business_owner (niet "owner")
  const isOwner = roles.includes("business_owner");

  // user: expliciet user óf geen rollen (default)
  const isUser = roles.includes("user") || roles.length === 0;

  return { roles, isSuperAdmin, isAdmin, isOwner, isUser };
}