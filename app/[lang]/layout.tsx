import type { ReactNode } from "react";
import ClientRoot from "../ClientRoot";

export default function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { lang: string };
}) {
  const { lang } = params;

  return (
    <ClientRoot lang={lang}>
      {children}
    </ClientRoot>
  );
}