// app/[lang]/business/auth/page.tsx

// SERVER component – hier GEEN "use client"
import AuthClient from "./ui/AuthClient";
import { translations, type Language } from "@/i18n/translations";
import { isLocale } from "@/i18n/config";

// Optioneel: voorkom server-caching voor auth-pagina’s
export const dynamic = "force-dynamic";

type Params = {
  lang: string;
};

// In Next 15/16 is params een Promise, daarom zo getypt
type PageProps = {
  params: Promise<Params>;
};

export default async function BusinessAuthPage({ params }: PageProps) {
  // ✅ params-Promise eerst uitpakken
  const { lang: rawLang } = await params;

  // Altijd een geldige taal afdwingen
  const lang: Language = isLocale(rawLang) ? (rawLang as Language) : "en";

  // Vertalingen voor deze taal
  const t = translations[lang];

  // Alles doorgeven aan je client-component
  return <AuthClient lang={lang} t={t} />;
}