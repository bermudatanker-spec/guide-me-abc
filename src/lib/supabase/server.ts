// src/lib/supabase/server.ts
import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

type CookieKV = { name: string; value: string };

function parseCookieHeader(headerValue: string | null): CookieKV[] {
  if (!headerValue) return [];
  return headerValue
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((kv) => {
      const eq = kv.indexOf("=");
      if (eq === -1) return { name: kv, value: "" };
      const name = kv.slice(0, eq);
      const value = kv.slice(eq + 1); // niet decodeURIComponent nodig
      return { name, value };
    });
}

// ✅ Next 15/16: async, want cookies() / headers() zijn async
export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // ✅ universele read via headers (werkt overal)
  const h = await headers();
  const cookieHeader = h.get("cookie");
  const allFromHeader = parseCookieHeader(cookieHeader);

  return createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      // Supabase SSR verwacht getAll()
      getAll() {
        return allFromHeader;
      },

      // Supabase SSR verwacht setAll() (refresh tokens etc)
      // In Server Components kan dit niet -> try/catch
      async setAll(cookiesToSet) {
        try {
          const store = await cookies(); // ✅ Next 15/16
          cookiesToSet.forEach(({ name, value, options }) => {
            store.set(name, value, options);
          });
        } catch {
          // Server Components mogen niet setten -> negeren
        }
      },
    },
  });
}