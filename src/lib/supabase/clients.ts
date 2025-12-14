// src/lib/supabase/clients.ts
import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (CSR)
 * - gebruikt anon key
 * - session wordt beheerd via cookies/local storage onderwater door supabase
 */
export function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return createBrowserClient(url, anon);
}