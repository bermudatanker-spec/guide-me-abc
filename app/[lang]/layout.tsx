// src/app/[lang]/layout.tsx
import type { ReactNode } from "react";
import { Suspense } from "react";
import type { Metadata } from "next";

import ClientRoot from "../ClientRoot";
import { isLocale, type Locale, LOCALES } from "@/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPlatformSettings } from "@/lib/platform-settings";
import { buildLanguageAlternates } from "@/lib/seo/alternates";
import NavigationServer from "./_components/NavigationServer";

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ lang: string }>;
};

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "en";
  const basePath = "";

  return {
    metadataBase: new URL("https://guide-me-abc.com"),
    alternates: {
      canonical: `/${lang}${basePath}`,
      languages: buildLanguageAlternates(LOCALES, basePath),
    },
  };
}

function LoadingShell() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-4">
      <span className="text-sm text-muted-foreground">Guide Me ABC wordt geladen…</span>
    </main>
  );
}

function normalizeRoles(input: unknown): string[] {
  if (Array.isArray(input)) return input.map((r) => String(r).toLowerCase());
  if (typeof input === "string") return [input.toLowerCase()];
  return [];
}

export default async function LangLayout({ children, params }: LayoutProps) {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "en";

  const [settings, user] = await Promise.all([
    getPlatformSettings(),
    (async () => {
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase.auth.getUser();
      return data.user ?? null;
    })(),
  ]);

  const roles = normalizeRoles((user?.app_metadata as any)?.roles);
  const isSuperAdmin = roles.includes("super_admin") || roles.includes("superadmin");

  if (settings?.maintenance_mode && !isSuperAdmin) {
    const isNl = lang === "nl";
    return (
      <main className="min-h-dvh flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold">
            {isNl ? "Tijdelijk niet beschikbaar" : "Temporarily unavailable"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isNl
              ? "Guide Me ABC is tijdelijk in onderhoud. Probeer het later opnieuw."
              : "Guide Me ABC is currently under maintenance. Please try again later."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* ✅ SERVER header: krijgt cookies en isLoggedIn klopt altijd */}
      <NavigationServer lang={lang} />

      <Suspense fallback={<LoadingShell />}>
        <ClientRoot lang={lang}>
          <main id="page-content" className="min-h-dvh pt-16">
            {children}
          </main>
        </ClientRoot>
      </Suspense>
    </>
  );
}