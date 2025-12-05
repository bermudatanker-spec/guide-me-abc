import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Server-side Supabase client (Next.js App Router compatible).
 * Te gebruiken in server components, server actions en route handlers.
 */
export function createClient() {
  const cookieStore = cookies();

  const getCookie = (name: string): string | undefined => {
    try {
        // @ts-expect-error: cookies().get bestaat runtime wel, maar TS types
      return cookieStore.get(name)?.value;
    } catch {
      return undefined;
    }
  };

  const setCookie = (
    name: string,
    value: string,
    options: CookieOptions = {},
  ) => {
    try {
      // In server components is cookies() read-only, in actions/handlers schrijfbaar.
      // TypeScript kent hier alleen de read-only variant, daarom onderdrukken we de error.
      // @ts-expect-error cookies().set bestaat wél in de context waarin Supabase 'm nodig heeft.
      cookieStore.set({
        name,
        value,
        path: "/",
        ...options,
      });
    } catch {
      // In een read-only context (pure RSC) negeren we het gewoon.
    }
  };

  const removeCookie = (name: string, options: CookieOptions = {}) => {
    setCookie(name, "", { ...options, maxAge: 0 });
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: getCookie,
        set: setCookie,
        remove: removeCookie,
      },
    },
  );
}

/**
 * Backwards compatible alias:
 * oude code die { supabaseServer } importeert blijft zo gewoon werken.
 */
export const supabaseServer = createClient;