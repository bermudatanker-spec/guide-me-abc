// src/lib/auth/requireSuperAdminServer.ts
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

function normalizeRole(v?: unknown) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function isAllowed(role?: unknown, roles?: unknown) {
  const set = new Set<string>();
  const r1 = normalizeRole(role);
  if (r1) set.add(r1);

  if (Array.isArray(roles)) {
    for (const r of roles) {
      const rr = normalizeRole(r);
      if (rr) set.add(rr);
    }
  }

  return (
    set.has("superadmin") ||
    set.has("super_admin") ||
    set.has("godmode") ||
    set.has("god_mode")
  );
}

/**
 * ✅ App Router friendly guard:
 * - Returns NOTHING
 * - Either continues OR redirects (throws internally)
 */
export async function requireSuperAdminServer(opts?: { lang?: string }) {
  const lang = opts?.lang ?? "en";

  const cookieStore = await cookies(); // ok als jouw Next dit async maakt

  // ✅ Gebruik ANON key voor auth/session (cookies).
  // ❌ Service role key hoort NIET in pages/components.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ✅
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();

  // Niet ingelogd → naar login
  if (error || !data?.user) {
    redirect(`/${lang}/login`);
  }

  const meta = data.user.app_metadata ?? {};
  const role = (meta as any).role;
  const roles = (meta as any).roles;

  // Niet toegestaan → terug naar home
  if (!isAllowed(role, roles)) {
    redirect(`/${lang}`);
  }

  // ✅ toegestaan → gewoon doorrenderen
}