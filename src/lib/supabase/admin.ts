// src/lib/supabase/admin.ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

export function supabaseAdmin() {
  // ✅ support beide namen (jij hebt NEXT_PUBLIC_SUPABASE_URL)
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "";

  const service =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    "";

  if (!url || !service) {
    // geef expliciet terug wat ontbreekt, zodat je nooit meer hoeft te raden
    const missing = [
      !url ? "SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL" : null,
      !service ? "SUPABASE_SERVICE_ROLE_KEY" : null,
    ].filter(Boolean);

    throw new Error(`Missing ${missing.join(" + ")} in env`);
  }

  return createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}