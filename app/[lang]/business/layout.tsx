// app/[lang]/business/layout.tsx

import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";

export default function BusinessLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { lang: string };
}) {
  const rawLang = params.lang;

  // Als de taal ongeldig is → 404
  if (!isLocale(rawLang)) {
    notFound();
  }

  // Geldige locale (nog niet echt gebruikt, maar kan later handig zijn)
  const lang: Locale = rawLang;

  return <>{children}</>;
}