// components/AuthCodeForwarder.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";

/**
 * Vangt Supabase auth callbacks op voor:
 * - magic links / OAuth / PKCE (?code=..., etc.)
 *
 * ❌ NIET voor password recovery (type=recovery → /[lang]/business/reset-password)
 *    Die flow handelen we direct af op de reset-password pagina.
 */
export default function AuthCodeForwarder() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1) Nooit op /auth/callback zelf ingrijpen (anders loop)
    if (pathname.startsWith("/auth/callback")) return;

    // 2) Nooit ingrijpen op de reset-password pagina
    if (pathname.includes("/business/reset-password")) return;

    const { hash } = window.location;

    const segments = pathname.split("/").filter(Boolean);
    const first = segments[0] ?? "en";
    const langGuess: Locale = isLocale(first) ? first : "en";

    const qs = new URLSearchParams(searchParams?.toString());
    const hs = new URLSearchParams(hash.replace(/^#/, ""));

    const typeInQuery = qs.get("type");
    const typeInHash = hs.get("type");

    // 3) Password recovery links (type=recovery) met rust laten
    if (typeInQuery === "recovery" || typeInHash === "recovery") {
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