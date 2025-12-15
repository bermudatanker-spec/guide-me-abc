import type { Locale } from "@/i18n/config";
import { isLocale } from "@/i18n/config";
import AdminBusinessesClient from "./ui/AdminBusinessesClient";

export const dynamic = "force-dynamic";

type Params = { lang: string };
type PageProps = { params: Promise<Params> };

export default async function Page({ params }: PageProps) {
  const { lang: rawLang } = await params;
  const lang: Locale = isLocale(rawLang) ? (rawLang as Locale) : "en";
  return <AdminBusinessesClient lang={lang} />;
}