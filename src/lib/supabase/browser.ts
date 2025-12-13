// src/lib/supabase/browser.ts
"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient, Session, AuthChangeEvent } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let _client: SupabaseClient<Database> | null = null;

export function supabaseBrowser(): SupabaseClient<Database> {
  if (_client) return _client;
  _client = createBrowserClient<Database>(URL, ANON);
  return _client;
}

export const supabase = supabaseBrowser();

// helpers (zoals jij eerder had)
export async function getSession(): Promise<{ session: Session | null }> {
  const { data } = await supabase.auth.getSession();
  return { session: data?.session ?? null };
}

export function onAuthStateChange(cb: (event: AuthChangeEvent, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange(cb);
}

export async function signUp(email: string, password: string, fullName?: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: fullName ? { full_name: fullName } : undefined },
  });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signInWithOtp(email: string) {
  return supabase.auth.signInWithOtp({ email });
}

export async function signOut() {
  await supabase.auth.signOut();
}

export const authService = {
  supabase,
  getSession,
  onAuthStateChange,
  signUp,
  signIn,
  signInWithOtp,
  signOut,
};

export type { SupabaseClient, Session, AuthChangeEvent };