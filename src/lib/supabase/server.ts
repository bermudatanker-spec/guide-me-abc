// src/lib/supabase/server.ts
"use server";

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Server-side Supabase client voor Next.js App Router (Next 16, async cookies()).
 * Te gebruiken in server components, server actions en route handlers.
 */
export async function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error("[supabaseServer] Missing NEXT_PUBLIC_SUPABASE_URL or ANON_KEY");
    throw new Error("Supabase is not configured correctly");
  }

  // In Next 16 is cookies() async → eerst awaiten
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        // Supabase verwacht string | undefined
        const cookie = cookieStore.get(name);
        return cookie?.value;
      },
      set(name: string, value: string, options: CookieOptions = {}) {
        try {
          cookieStore.set({
            name,
            value,
            path: "/",
            ...options,
          });
        } catch {
          // In pure RSC context kan set() read-only zijn – fout mag je negeren
        }
      },
      remove(name: string, options: CookieOptions = {}) {
        try {
          cookieStore.set({
            name,
            value: "",
            path: "/",
            maxAge: 0,
            ...options,
          });
        } catch {
          // idem als set()
        }
      },
    },
  });
}

// Optionele alias als je ergens { supabaseServer as createSupabaseServer } doet
export const createServerSupabaseClient = supabaseServer;