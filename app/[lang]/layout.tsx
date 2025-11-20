// app/[lang]/layout.tsx
import type { ReactNode } from "react";
import MainNavbar from "@/components/layout/MainNavbar";
import SiteFooter from "@/components/layout/SiteFooter";

export default function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { lang: string };
}) {
  const lang = params.lang;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50/60 to-background">
      <MainNavbar lang={lang} />
      <div className="flex-1 pt-20 pb-10">{children}</div>
      <SiteFooter lang={lang} />
    </div>
  );
}