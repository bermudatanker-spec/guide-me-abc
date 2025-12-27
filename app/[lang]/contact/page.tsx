// app/[lang]/contact/page.tsx
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import ContactClient from "./ui/ContactClient";

type PageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "en";

  const title =
    lang === "nl"
      ? "Contact | Guide Me ABC"
      : lang === "pap"
      ? "Kontakto | Guide Me ABC"
      : lang === "es"
      ? "Contacto | Guide Me ABC"
      : "Contact | Guide Me ABC";

  const description =
    lang === "nl"
      ? "Vragen of feedback? Neem contact op met Guide Me ABC."
      : lang === "pap"
      ? "Tin pregunta òf feedback? Tuma kontakto ku Guide Me ABC."
      : lang === "es"
      ? "¿Tienes preguntas o comentarios? Contáctanos."
      : "Questions or feedback? Contact Guide Me ABC.";

  // ✅ Fix voor “pap rode kronkel”
  const languages: Record<string, string> = {
    en: "/en/contact",
    nl: "/nl/contact",
    pap: "/pap/contact",
    es: "/es/contact",
  };

  return {
    title,
    description,
    metadataBase: new URL("https://guide-me-abc.com"),
    alternates: {
      canonical: `/${lang}/contact`,
      languages,
    },
    openGraph: {
      title,
      description,
      url: `/${lang}/contact`,
      type: "website",
    },
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "en";

  return <ContactClient lang={lang} />;
}