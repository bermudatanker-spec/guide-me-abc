// app/[lang]/layout.tsx
import type { ReactNode } from "react";
import ClientRoot from "../ClientRoot";

type LangLayoutProps = {
  children: ReactNode;
  params: Promise<{ lang: string }>;
};

export default async function LangLayout({ children, params }: LangLayoutProps) {
  const { lang } = await params;

  return (
    <html lang={lang}>
      <body>
        <ClientRoot lang={lang}>
          <main id="page-content" className="min-h-dvh pt-16">
            {children}
          </main>
        </ClientRoot>
      </body>
    </html>
  );
}