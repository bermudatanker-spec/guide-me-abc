// src/lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * URLs & keys vooraf definiëren — hiermee voorkom je rode kronkels bij createServerClient()
 */
const url: string = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!url || !anonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

/**
 * Supabase server client (async vanwege cookies() Promise)
 */
export async function createClient() {
  const cookieStore = (await cookies()) as any;

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        const cookie = cookieStore.get?.(name);
        return cookie?.value;
      },
      set(name: string, value: string, options: CookieOptions = {}) {
        try {
          cookieStore.set?.({
            name,
            value,
            path: "/",
            ...options,
          });
        } catch {
          /* RSC mag set() falen, negeren */
        }
      },
      remove(name: string, options: CookieOptions = {}) {
        try {
          cookieStore.set?.({
            name,
            value: "",
            path: "/",
            maxAge: 0,
            ...options,
          });
        } catch {
          /* idem */
        }
      },
    },
  });
}

/** Compatibiliteit alias */
export const supabaseServer = createClient;