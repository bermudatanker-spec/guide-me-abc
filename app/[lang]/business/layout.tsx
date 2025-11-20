// app/[lang]/business/layout.tsx
import type { ReactNode } from "react";
import { isLocale, type Locale } from "@/i18n/config";

export default async function BusinessLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";

  return <>{children}</>;
}