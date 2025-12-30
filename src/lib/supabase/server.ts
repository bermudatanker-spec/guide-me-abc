// src/lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function supabaseServer() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        try {
          return cookieStore.get(name)?.value;
        } catch {
          return undefined;
        }
      },
      set(name: string, value: string, options: any = {}) {
        try {
          cookieStore.set({
            name,
            value,
            path: "/",
            ...options,
          });
        } catch {
          // in RSC mag dit falen zonder alles te breken
        }
      },
      remove(name: string, options: any = {}) {
        try {
          cookieStore.set({
            name,
            value: "",
            path: "/",
            maxAge: 0,
            ...options,
          });
        } catch {
          // idem
        }
      },
    },
  });
}

/**
 * ✅ Alias zodat je imports overal kloppen
 * (page.tsx en route.ts gebruiken deze naam)
 */
export const createServerSupabaseClient = supabaseServer;