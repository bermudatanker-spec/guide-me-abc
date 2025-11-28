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
 */
export async function supabaseServer() {
  // In Next 16 gedraagt cookies() zich als een async API → daarom `await`
  const cookieStore = await cookies();

  const safeGet = (name: string): string | undefined => {
    try {
      const v: any = cookieStore.get(name);
      return typeof v === "string" ? v : v?.value;
    } catch {
      return undefined;
    }
  };

  const safeSet = (name: string, value: string, options: CookieOptions) => {
    const opts = { path: "/", ...options };

    try {
      // Nieuwe signature (object)
      (cookieStore as any).set?.({ name, value, ...opts });
    } catch {
      try {
        // Fallback tuple signature
        (cookieStore as any).set?.(name, value, opts);
      } catch {
        // laatste redmiddel: negeren
      }
    }
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