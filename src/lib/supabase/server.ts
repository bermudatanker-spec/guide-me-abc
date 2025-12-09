// lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Geen async → return type is direct de Supabase client
export async function supabaseServer() {
  // cookies() kan in Next 16 als Promise getype-checked worden,
  // we casten naar "any" zodat we gewoon .get/.set kunnen gebruiken
  // zonder TypeScript gezeur. Dit is alleen type-level, runtime blijft goed.
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );
}