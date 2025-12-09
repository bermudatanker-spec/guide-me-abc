// lib/auth/is-super-admin.ts
import type { User } from "@supabase/supabase-js";

export function isSuperAdmin(user: User | null | undefined): boolean {
  const roles = (user?.app_metadata as any)?.roles ?? [];
  return Array.isArray(roles)
    ? roles.map((r:any)=>String(r).toLowerCase()).includes("super_admin")
    : false;
}