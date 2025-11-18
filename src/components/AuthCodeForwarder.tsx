// components/AuthCodeForwarder.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Vangt Supabase auth-terugkeer op in zowel:
 * - hash (#access_token, #type=recovery, ...)
 * - query (?code=..., ?error=..., ?type=recovery)
 * en stuurt alles door naar /auth/callback als querystring.
 */
export default function AuthCodeForwarder() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const { pathname, search, hash } = window.location;

    // 1) Huidige taal uit pad (eerste segment)
    const langGuess = pathname.split("/").filter(Boolean)[0] || "en";

    // 2) Pak zowel query als hash
    const qs = new URLSearchParams(search);                // ?code=..., ?error=..., ?type=...
    const hs = new URLSearchParams(hash.replace(/^#/, "")); // #access_token=..., #type=recovery, ...

    // Indicatoren dat dit een Supabase-auth terugkeer is
    const hasAuthQuery =
      qs.has("code") || qs.has("error") || qs.has("error_code") || qs.has("type");
    const hasAuthHash =
      hs.has("access_token") || hs.has("refresh_token") || hs.has("type") || hs.has("error");

    if (!hasAuthQuery && !hasAuthHash) return;

    // 3) Combineer alles naar één querystring richting /auth/callback
    const out = new URLSearchParams();

    // alles uit query behouden
    qs.forEach((v, k) => out.set(k, v));
    // alles uit hash toevoegen (zonder te overschrijven wat er al staat)
    hs.forEach((v, k) => {
      if (!out.has(k)) out.set(k, v);
    });

    // taal meesturen als die nog niet aanwezig is
    if (!out.has("lang")) out.set("lang", langGuess);

    router.replace(`/auth/callback?${out.toString()}`);
  }, [router]);

  return null;
}