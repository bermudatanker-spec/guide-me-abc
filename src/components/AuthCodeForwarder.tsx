// components/AuthCodeForwarder.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";

/**
 * Vangt Supabase auth-terugkeer op in zowel:
 * - hash (#access_token, #type=recovery, ...)
 * - query (?code=..., ?error=..., ?type=recovery)
 * en stuurt alles door naar /auth/callback als querystring.
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

    // 1) Huidige taal uit pad (eerste segment)
    const segments = pathname.split("/").filter(Boolean);
    const first = segments[0] ?? "en";
    const langGuess: Locale = isLocale(first) ? first : "en";

    // 2) Pak zowel query als hash
    const qs = new URLSearchParams(searchParams?.toString()); // ?code=..., ?error=..., ?type=...
    const hs = new URLSearchParams(hash.replace(/^#/, ""));   // #access_token=..., #type=recovery, ...

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

    // 3) Combineer alles naar één querystring richting /auth/callback
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