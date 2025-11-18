// app/[lang]/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { LanguageProvider } from "@/hooks/useLanguage";
import AuthCodeForwarder from "@/components/AuthCodeForwarder";

type ParamsPromise = Promise<{ lang: string }>;

function resolveLang(raw?: string): Locale {
  return isLocale(raw as any) ? (raw as Locale) : "en";
}

/* ─────────────── Metadata ─────────────── */
export async function generateMetadata(
  { params }: { params: ParamsPromise }
): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = resolveLang(raw);

  const languages: Record<string, string> = {
    en: "/en",
    nl: "/nl",
    pap: "/pap",
    es: "/es",
  };

  const title = "Guide Me ABC";
  const description =
    "Your guide to Aruba, Bonaire & Curaçao – beaches, restaurants, tours and trusted local businesses.";

  return {
    title,
    description,
    alternates: { languages },
    openGraph: {
      title,
      description,
      url: `/${lang}`,
    },
  };
}

/* ─────────────── Layout ─────────────── */
export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: ParamsPromise;
}) {
  const { lang: raw } = await params;
  const lang = resolveLang(raw);

  return (
    <LanguageProvider initialLang={lang}>
      <AuthCodeForwarder />
      <Navigation />
      <main
        id="page-content"
        className="min-h-dvh bg-background"
        data-lang={lang}
      >
        {children}
      </main>
    </LanguageProvider>
  );
}