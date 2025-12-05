// lib/auth/get-role-flags.ts
import type { User } from "@supabase/supabase-js";

export function getRoleFlags(user: User | null) {
  const roles = (user?.app_metadata?.roles ?? []) as string[];

  const isSuperAdmin = roles.includes("super_admin");
  const isOwner = roles.includes("owner");
  const isUser = roles.includes("user") || roles.length === 0;

  return { roles, isSuperAdmin, isOwner, isUser };
}