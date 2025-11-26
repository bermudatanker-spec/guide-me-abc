// src/components/AuthCodeForwarder.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";

/**
 * AuthCodeForwarder
 *
 * Vangt Supabase-auth callbacks op (met code/token in ?query of #hash)
 * en stuurt alles door naar /auth/callback, mét lang=?.
 *
 * -> Geen UI, alleen router-logica.
 */
const AuthCodeForwarder: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();

  useEffect(() => {
    // SSR / safety
    if (typeof window === "undefined") return;

    // voorkom infinite loop als we al op de callback route zitten
    if (pathname.startsWith("/auth/callback")) return;

    const { hash } = window.location;

    // 1) Taal uit pad halen (eerste segment)
    const segments = pathname.split("/").filter(Boolean);
    const first = segments[0] ?? "en";
    const langGuess: Locale = isLocale(first) ? first : "en";

    // 2) Query + hash uitlezen
    const qs = new URLSearchParams(searchParams?.toString()); // ?code=..., ?error=...
    const hs = new URLSearchParams(hash.replace(/^#/, ""));   // #access_token=..., #type=...

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

    // Als er geen auth-params zijn: niets doen
    if (!hasAuthQuery && !hasAuthHash) return;

    // 3) Alles combineren naar één nette querystring
    const out = new URLSearchParams();

    // alles uit ?query behouden
    qs.forEach((v, k) => out.set(k, v));

    // alles uit #hash erbij, zonder bestaande keys te overschrijven
    hs.forEach((v, k) => {
      if (!out.has(k)) out.set(k, v);
    });

    // taal meesturen
    if (!out.has("lang")) out.set("lang", langGuess);

    router.replace(`/auth/callback?${out.toString()}`);
  }, [pathname, searchParams, router]);

  return null;
};

export default AuthCodeForwarder;