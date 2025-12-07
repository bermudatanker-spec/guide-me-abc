// app/[lang]/business/auth/page.tsx
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import AuthClient from "./ui/AuthClient";

type PageParams = { lang: Locale };

type PageProps = {
  params: Promise<PageParams>;
};

// SEO (optioneel, maar meteen goed)
export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "en";
  const isNl = lang === "nl";

  return {
    title: isNl
      ? "Ondernemers login | Guide Me ABC"
      : "Business login | Guide Me ABC",
    description: isNl
      ? "Log in of maak een account aan om je bedrijfsvermelding te beheren."
      : "Sign in or create an account to manage your business listing.",
  };
}

export default async function BusinessAuthPage({ params }: PageProps) {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "en";

  return <AuthClient lang={lang} />;
}