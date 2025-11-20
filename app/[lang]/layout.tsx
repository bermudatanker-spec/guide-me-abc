// app/[lang]/layout.tsx
import type { ReactNode } from "react";
import ClientRoot from "../ClientRoot";

export default function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { lang: string };
}) {
  return (
    <html lang={params.lang}>
      <body>
        <ClientRoot lang={params.lang}>
          <main id="page-content" className="min-h-dvh pt-16">
            {children}
          </main>
        </ClientRoot>
      </body>
    </html>
  );
}