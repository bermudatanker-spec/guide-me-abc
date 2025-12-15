// app/[lang]/admin/businesses/page.tsx
import { isLocale, type Locale } from "@/i18n/config";
import AdminBusinessesClient from "./ui/AdminBusinessesClient";

export const dynamic = "force-dynamic";

type Params = { lang: string };

// ✅ Next 15: params kan Promise zijn
export default async function Page({
  params,
}: {
  params: Promise<Params> | Params;
}) {
  const p = (params as any)?.then ? await (params as Promise<Params>) : (params as Params);

  const rawLang = p?.lang ?? "en";
  const lang: Locale = isLocale(rawLang) ? (rawLang as Locale) : "en";

  return <AdminBusinessesClient lang={lang} />;
}