// components/AuthCodeForwarder.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";

/**
 * Vangt Supabase auth-terugkeer op in zowel:
 * - hash (#access_token, #type=recovery, ...)
 * - query (?code=..., ?error=..., ?type=recovery)
 *
 * ⚠️ Uitzondering:
 * - type=recovery (reset wachtwoord) → NIET doorsturen,
 *   die moet direct naar /[lang]/business/reset-password gaan.
 */
export default function AuthCodeForwarder() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // voorkom loop als we al op /auth/callback zitten
    if (pathname.startsWith("/auth/callback")) return;

    const { hash } = window.location;

    const segments = pathname.split("/").filter(Boolean);
    const first = segments[0] ?? "en";
    const langGuess: Locale = isLocale(first) ? first : "en";

    const qs = new URLSearchParams(searchParams?.toString());
    const hs = new URLSearchParams(hash.replace(/^#/, ""));

    // 👇 NEW: als dit een password-recovery flow is → met rust laten
    const typeParam = qs.get("type") || hs.get("type");
    if (typeParam === "recovery") {
      // reset-password pagina handelt dit verder af
      return;
    }

    const hasAuthQuery =
      qs.has("code") ||
      qs.has("error") ||
      qs.has("error_code") ||
      qs.has("type");

    const hasAuthHash =
      hs.has("access_token") ||
      hs.has("refresh_token") ||
      hs.has("type") ||
      hs.has("error");

    if (!hasAuthQuery && !hasAuthHash) return;

    const out = new URLSearchParams();

    qs.forEach((v, k) => out.set(k, v));
    hs.forEach((v, k) => {
      if (!out.has(k)) out.set(k, v);
    });

    if (!out.has("lang")) out.set("lang", langGuess);

    router.replace(`/auth/callback?${out.toString()}`);
  }, [pathname, searchParams, router]);

  return null;
}