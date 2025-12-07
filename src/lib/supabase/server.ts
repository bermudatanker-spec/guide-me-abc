// src/lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Server-side Supabase client (Next.js App Router compatible).
 * Te gebruiken in server components, server actions en route handlers.
 */
export function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // TS vindt .get soms niet leuk, daarom casten we naar any
          const cookieStore = cookies() as any;
          const cookie = cookieStore.get?.(name);
          // Supabase verwacht een string of undefined
          return cookie?.value ?? cookie ?? undefined;
        },
        set(name: string, value: string, options: CookieOptions = {}) {
          try {
            const cookieStore = cookies() as any;
            cookieStore.set({
              name,
              value,
              path: "/",
              ...options,
            });
          } catch {
            // In een read-only context (pure RSC) negeren we het gewoon.
          }
        },
        remove(name: string, options: CookieOptions = {}) {
          try {
            const cookieStore = cookies() as any;
            cookieStore.set({
              name,
              value: "",
              path: "/",
              maxAge: 0,
              ...options,
            });
          } catch {
            // idem: read-only -> negeren
          }
        },
      },
    }
  );
}

/**
 * Backwards compatible alias:
 * oude code die { supabaseServer } importeert blijft zo gewoon werken.
 */
export const supabaseServer = createClient;