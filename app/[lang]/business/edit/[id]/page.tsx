// app/[lang]/business/edit/[id]/page.tsx
import EditBusinessClient from "./ui/EditBusinessClient";
import { isLocale, type Locale } from "@/i18n/config";

type Params = { lang: string; id: string };

type PageProps = {
  params: Promise<Params>;
};

export default async function Page({ params }: PageProps) {
  const { lang } = await params;

  const safeLang: Locale = isLocale(lang) ? lang : "en";

  return <EditBusinessClient lang={safeLang} />;
}