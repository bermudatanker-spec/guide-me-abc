// app/[lang]/business/layout.tsx
import type { ReactNode } from "react";
import { notFound } from "next/navigation";

type Lang = "en" | "nl" | "pap" | "es";

export default async function BusinessLayout(
  { children, params }: { children: ReactNode; params: Promise<{ lang: Lang }> }
) {
  const { lang } = await params; // ⬅️ verplicht in Next 15/16
  if (!["en","nl","pap","es"].includes(lang)) notFound();

  return <>{children}</>;
}