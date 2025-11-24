// app/[lang]/layout.tsx
import type { ReactNode } from "react";
import ClientRoot from "../ClientRoot";
import { isLocale, type Locale } from "@/i18n/config";

type LangLayoutProps = {
  children: ReactNode;
  params: Promise<{ lang: string }>; // ← Dit is de key: Promise<{ lang: string }>
};

export default async function LangLayout({ children, params }: LangLayoutProps) {
  const { lang: rawLang } = await params; // ← Await de params
  const lang: Locale = isLocale(rawLang) ? rawLang : "en";

  return (
    <ClientRoot lang={lang}>
      <main id="page-content" className="min-h-dvh pt-16">
        {children}
      </main>
    </ClientRoot>
  );
}