// app/[lang]/business/auth/page.tsx
import AuthClient from "./ui/AuthClient";
import { translations, type Language } from "@/i18n/translations";
import { isLocale } from "@/i18n/config";

type PageProps = {
  params: { lang: string };
};

// Auth-pagina nooit cachen
export const dynamic = "force-dynamic";

export default function BusinessAuthPage({ params }: PageProps) {
  const rawLang = params.lang;
  const lang: Language = isLocale(rawLang) ? (rawLang as Language) : "en";

  const t = translations[lang];

  return <AuthClient lang={lang} t={t} />;
}