// app/[lang]/business/auth/page.tsx

// ✅ SERVER component – hier GEEN "use client"
import AuthClient from "./ui/AuthClient";
import { translations, type Language } from "@/i18n/translations";
import { isLocale } from "@/i18n/config";

// Optioneel: voorkom server-caching voor auth-pagina’s
export const dynamic = "force-dynamic";

type Params = {
  lang: string;
};

export default async function BusinessAuthPage({
  params,
}: {
  params: Params;
}) {
  // raw lang uit de URL
  const rawLang = params.lang;

  // Zorgen dat lang altijd een geldige taal is
  const lang: Language = isLocale(rawLang) ? (rawLang as Language) : "en";

  // Vertalingen voor deze taal
  const t = translations[lang];

  // Alles doorgeven aan je client component
  return <AuthClient lang={lang} t={t} />;
}