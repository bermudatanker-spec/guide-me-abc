// app/[lang]/business/layout.tsx
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";

type ParamsPromise = Promise<{ lang: string }>;

export default async function BusinessLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: ParamsPromise;
}) {
  // Promise params uitpakken
  const { lang: rawLang } = await params;

  // Als lang ongeldig is → 404
  if (!isLocale(rawLang)) {
    notFound();
  }

  // Eventueel nog als Locale casten als je het later nodig hebt
  const lang: Locale = isLocale(rawLang) ? rawLang : "en";

  return <>{children}</>;
}