// src/lib/supabase/browser.ts
"use client";

import { createBrowserClient } from "@supabase/ssr";
import type {
  SupabaseClient,
  Session,
  AuthChangeEvent,
} from "@supabase/supabase-js";

/** Zorg dat deze 2 env-vars bestaan (.env.local) */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if ((!URL || !ANON) && process.env.NODE_ENV !== "production") {
  console.warn(
    "[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Zet ze in .env.local en herstart je dev server."
  );
}

/** Absolute callback URL (werkt lokaal en in productie) */
export function getCallbackUrl() {
  if (typeof window === "undefined") return "/auth/callback";
  return `${window.location.origin}/auth/callback`;
}

/**
 * Supabase types declareren emailRedirectTo niet in de top-level auth-config,
 * terwijl de runtime het wel ondersteunt via @supabase/ssr.
 */
type ExtendedAuthConfig = NonNullable<
  Parameters<typeof createBrowserClient>[2]
>["auth"] & {
  emailRedirectTo?: string;
};

/** Singleton browser client (voorkomt dubbele instanties) */
let _client: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient {
  if (_client) return _client;

  const authConfig: ExtendedAuthConfig = {
    flowType: "pkce",
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // sessie in cookies houden zodat middleware 'm kan lezen
    emailRedirectTo:
      typeof window !== "undefined" ? getCallbackUrl() : undefined,
  };

  _client = createBrowserClient(URL, ANON, { auth: authConfig });
  return _client;
}

/** Directe instantie (alleen client-side gebruiken) */
export const supabase = supabaseBrowser();

/* ───────────────────────── Helper-functies ───────────────────────── */

export async function getSession(): Promise<{ session: Session | null }> {
  const { data, error } = await supabase.auth.getSession();
  if (error && process.env.NODE_ENV !== "production") {
    console.warn("[supabase] getSession error:", error.message);
  }
  return { session: data?.session ?? null };
}

export function onAuthStateChange(
  cb: (event: AuthChangeEvent, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange(cb);
}

/** E-mail + wachtwoord sign-up */
export async function signUp(
  email: string,
  password: string,
  fullName?: string
) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: fullName ? { full_name: fullName } : undefined,
      emailRedirectTo: getCallbackUrl(),
    },
  });
}

/** E-mail + wachtwoord login */
export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

/** Magic link / OTP login (ook gebruikt door password-reset mails) */
export async function signInWithOtp(email: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: getCallbackUrl() },
  });
}

/** Uitloggen */
export async function signOut() {
  await supabase.auth.signOut();
}

/** Compatibele service-laag */
export const authService = {
  supabase, // direct client (client-side)
  getSession, // () => Promise<{ session: Session | null }>
  onAuthStateChange, // (cb) => subscription
  signUp,
  signIn,
  signInWithOtp,
  signOut,
};

export type { SupabaseClient, Session, AuthChangeEvent };