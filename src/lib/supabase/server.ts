// src/lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // ✅ Next 15/16: cookies() is async
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      // Supabase SSR verwacht getAll/setAll
      getAll() {
        // ✅ in Next is dit aanwezig op cookieStore als je await gebruikt
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // In Server Components mag setten soms niet → gewoon negeren
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // noop
        }
      },
    },
  });
}