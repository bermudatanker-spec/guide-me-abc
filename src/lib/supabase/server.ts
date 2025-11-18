// lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// === Env check ==============================================================
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase env vars. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
  );
}

/**
 * Server-side Supabase client (Next.js 15/16 compatible)
 * - Vermijdt 'cookieStore.get is not a function'
 * - Typestil door gecontroleerde casts naar `any`
 */
export function supabaseServer() {
  const cookieStore = cookies(); // Next 16: RequestCookies-achtige proxy

  const safeGet = (name: string): string | undefined => {
    try {
      const s: any = cookieStore;

      // Nieuwere runtimes hebben getAll()
      if (typeof s.getAll === "function") {
        const hit = (s.getAll() as Array<{ name: string; value: string }>)
          .find((c) => c?.name === name);
        if (hit) return hit.value;
      }

      // Oudere runtimes hebben get(name)
      const g = s.get?.(name);
      return typeof g === "string" ? g : g?.value;
    } catch {
      return undefined;
    }
  };

  const safeSet = (name: string, value: string, options: CookieOptions) => {
    const s: any = cookieStore;
    const opts = { path: "/", ...options };

    // tuple signature
    try {
      s.set?.(name, value, opts);
      return;
    } catch {}

    // object signature
    try {
      s.set?.({ name, value, ...opts });
    } catch {}
  };

  const safeRemove = (name: string, options: CookieOptions) => {
    // In praktijk: set met lege waarde en maxAge 0
    safeSet(name, "", { ...options, maxAge: 0 });
  };

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get: safeGet,
      set: safeSet,
      remove: safeRemove,
    },
  });
}