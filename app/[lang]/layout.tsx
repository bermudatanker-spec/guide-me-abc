// src/app/[lang]/layout.tsx
import type { ReactNode } from "react";
import { Suspense } from "react";
import type { Metadata } from "next";

import ClientRoot from "../ClientRoot";
import { isLocale, type Locale, LOCALES } from "@/i18n/config";
import { supabaseServer } from "@/lib/supabase/server";
import { getPlatformSettings } from "@/lib/platform-settings";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ lang: string }>;
};

export const dynamic = "force-dynamic";

/** SEO: per-locale canonical + alternates */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "en";

  return {
    metadataBase: new URL("https://guide-me-abc.com"),
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `/${l}`])
      ) as Record<string, string>,
    },
  };
}

function LoadingShell() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-4">
      <span className="text-sm text-muted-foreground">
        Guide Me ABC wordt geladen…
      </span>
    </main>
  );
}

export default async function LangLayout({ children, params }: LayoutProps) {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "en";

  // Settings + user parallel
  const [settings, user] = await Promise.all([
    getPlatformSettings(),
    (async () => {
      const supabase = await supabaseServer();
      const { data } = await supabase.auth.getUser();
      return data.user ?? null;
    })(),
  ]);

  // Rollen robuust normaliseren (array OF string)
  const rawRoles = (user?.app_metadata as any)?.roles;

  let roles: string[] = [];
  if (Array.isArray(rawRoles)) {
    roles = rawRoles.map((r: any) => String(r).toLowerCase());
  } else if (typeof rawRoles === "string") {
    roles = [rawRoles.toLowerCase()];
  }

  const isSuperAdmin =
    roles.includes("super_admin") || roles.includes("superadmin");

  // Maintenance lock (behalve super_admin)
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
    <Suspense fallback={<LoadingShell />}>
      <ClientRoot lang={lang}>
        <main id="page-content" className="min-h-dvh pt-16">
          {children}
        </main>
      </ClientRoot>
    </Suspense>
  );
}