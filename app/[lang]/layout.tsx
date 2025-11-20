import type { ReactNode } from "react";

export default function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { lang: string };
}) {
  return <>{children}</>;
}