// src/components/nav/AccountLink.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getLangFromPath } from "@/lib/locale-path";
import type { Locale } from "@/i18n/config";

export default function AccountLink() {
  const pathname = usePathname() ?? "/";
  const lang = (getLangFromPath(pathname) || "en") as Locale;

  const isNl = lang === "nl";

  return (
    <Link
      href={`/${lang}/account`}
      className="text-sm font-medium text-foreground/80 hover:text-foreground transition"
    >
      {isNl ? "Mijn account" : "My account"}
    </Link>
  );
}