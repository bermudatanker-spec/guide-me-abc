// app/[lang]/layout.tsx
import type { ReactNode } from "react";
import { Suspense } from "react";
import ClientRoot from "../ClientRoot";
import { isLocale, type Locale } from "@/i18n/config";

type LayoutParams = {
  lang: string;
};

type LayoutProps = {
  children: ReactNode;
  params: Promise<LayoutParams>;
};

export default async function LangLayout({ children, params }: LayoutProps) {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "en";

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