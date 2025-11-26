// app/[lang]/layout.tsx
import type { ReactNode } from "react";
import ClientRoot from "../ClientRoot";
import { isLocale, type Locale } from "@/i18n/config";

type LayoutParams = {
  lang: string;
};

type LayoutProps = {
  children: ReactNode;
  params: Promise<LayoutParams>;
};

// ✅ Async layout zodat we `params` (Promise) kunnen awaiten
export default async function LangLayout({ children, params }: LayoutProps) {
  const { lang: raw } = await params;

  const lang: Locale = isLocale(raw) ? raw : "en";

  return (
    <ClientRoot lang={lang}>
      <main id="page-content" className="min-h-dvh pt-16">
        {children}
      </main>
    </ClientRoot>
  );
}