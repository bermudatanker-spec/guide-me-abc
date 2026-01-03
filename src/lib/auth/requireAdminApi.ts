import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getRoles(user: any): string[] {
  const meta = user?.app_metadata ?? {};
  const uMeta = user?.user_metadata ?? {};

  const raw =
    meta.roles ??
    meta.role ??
    user?.role ??
    uMeta.roles ??
    uMeta.role ??
    [];

  const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return arr.map((r) => String(r).trim().toLowerCase()).filter(Boolean);
}

function isAdmin(roles: string[]) {
  return (
    roles.includes("admin") ||
    roles.includes("moderator") ||
    roles.includes("super_admin") ||
    roles.includes("superadmin")
  );
}

export async function requireAdminApi(): Promise<
  | { ok: true; user: any }
  | { ok: false; res: NextResponse }
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return {
      ok: false,
      res: NextResponse.json({ error: error.message }, { status: 401 }),
    };
  }

  const user = data.user;
  if (!user) {
    return {
      ok: false,
      res: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
    };
  }

  const roles = getRoles(user);
  if (!isAdmin(roles)) {
    return {
      ok: false,
      res: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, user };
}