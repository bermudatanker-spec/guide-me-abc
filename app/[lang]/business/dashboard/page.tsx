// app/[lang]/business/dashboard/page.tsx

import type { Locale } from "@/i18n/config";
import { isLocale } from "@/i18n/config";
import { DICTS } from "@/i18n/dictionaries"; // ⬅️ dit is die met dashboardTitle, etc.
import DashboardClient from "./ui/DashboardClient";

export const dynamic = "force-dynamic";

type Params = { lang: string };

// In Next 15/16 is params een Promise
type PageProps = {
  params: Promise<Params>;
};

export default async function DashboardPage({ params }: PageProps) {
  const { lang: rawLang } = await params;

  const safeLang: Locale = isLocale(rawLang) ? (rawLang as Locale) : "en";

  const t = DICTS[safeLang];

  return <DashboardClient lang={safeLang} t={t} />;
}