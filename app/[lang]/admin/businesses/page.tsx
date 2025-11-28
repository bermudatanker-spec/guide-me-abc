// app/[lang]/admin/businesses/page.tsx
import AdminBusinessesClient from "./ui/AdminBusinessesClient";
import { isLocale, type Locale } from "@/i18n/config";

export const dynamic = "force-dynamic";

type Params = { lang: string };
type PageProps = { params: Promise<Params> };

export default async function AdminBusinessesPage({ params }: PageProps) {
  const { lang: rawLang } = await params;
  const lang: Locale = isLocale(rawLang) ? rawLang : "en";

  return <AdminBusinessesClient lang={lang} />;
}