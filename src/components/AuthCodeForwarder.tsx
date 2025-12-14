// src/components/AuthCodeForwarder.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function AuthCodeForwarder() {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // nooit op callback zelf (loop voorkomen)
    if (pathname.startsWith("/auth/callback")) return;

    // nooit op reset-password flow
    if (pathname.includes("/business/reset-password")) return;

    const hash = window.location.hash ?? "";

    const qs = new URLSearchParams(searchParams?.toString());
    const hs = new URLSearchParams(hash.replace(/^#/, ""));

    // recovery links met rust laten
    const typeInQuery = qs.get("type");
    const typeInHash = hs.get("type");
    if (typeInQuery === "recovery" || typeInHash === "recovery") return;

    const hasAuthQuery =
      qs.has("code") ||
      qs.has("error") ||
      qs.has("error_code") ||
      qs.has("error_description") ||
      qs.has("type");

    const hasAuthHash =
      hs.has("access_token") ||
      hs.has("refresh_token") ||
      hs.has("type") ||
      hs.has("error");

    if (!hasAuthQuery && !hasAuthHash) return;

    // combine query + hash
    const out = new URLSearchParams();
    qs.forEach((v, k) => out.set(k, v));
    hs.forEach((v, k) => {
      if (!out.has(k)) out.set(k, v);
    });

    // ✅ waar kwamen we vandaan?
    const redirectedFrom = `${pathname}${qs.toString() ? `?${qs.toString()}` : ""}`;
    out.set("redirectedFrom", redirectedFrom);

    // Ga naar server callback
    window.location.replace(`/auth/callback?${out.toString()}`);
  }, [pathname, searchParams]);

  return null;
}