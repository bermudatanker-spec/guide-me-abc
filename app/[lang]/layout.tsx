// app/[lang]/layout.tsx
import type { ReactNode } from "react";
import ClientRoot from "../ClientRoot";

type LayoutProps = {
  children: ReactNode;
  params: { lang: string };
};

export default function LangLayout({ children, params }: LayoutProps) {
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
