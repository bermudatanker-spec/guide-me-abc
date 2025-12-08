// app/[lang]/layout.tsx
import type { ReactNode } from "react";
import { Suspense } from "react";

import ClientRoot from "../ClientRoot";
import { isLocale, type Locale } from "@/i18n/config";
import { supabaseServer } from "@/lib/supabase/server";
import { getPlatformSettings } from "@/lib/platform-settings";

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  // ✅ nieuwe Next.js manier: params eerst awaiten
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "en";

  // 1) Settings + user parallel ophalen
  const [settings, user] = await Promise.all([
    getPlatformSettings(),
    (async () => {
      const supabase = await supabaseServer(); // ✅ supabaseServer is async
      const { data } = await supabase.auth.getUser();
      return data.user ?? null;
    })(),
  ]);

  // 2) Rollen normaliseren
  let roles: string[] = [];
  const rawRoles = (user?.app_metadata as any)?.roles;

  if (Array.isArray(rawRoles)) {
    roles = rawRoles.map((r: any) => String(r).toLowerCase());
  } else if (typeof rawRoles === "string") {
    roles = [rawRoles.toLowerCase()];
  }

  const isSuperAdmin =
    roles.includes("super_admin") || roles.includes("superadmin");

  const maintenanceOn = settings?.maintenance_mode;

  // 3) Maintenance-lock voor iedereen behalve super_admin
  if (maintenanceOn && !isSuperAdmin) {
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

  // 4) Normale layout
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh flex items-center justify-center">
          <span className="text-sm text-muted-foreground">
            Guide Me ABC wordt geladen…
          </span>
        </main>
      }
    >
      <ClientRoot lang={lang}>
        <main id="page-content" className="min-h-dvh pt-16">
          {children}
        </main>
      </ClientRoot>
    </Suspense>
  );
}