// app/[lang]/business/edit/[id]/page.tsx
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import EditBusinessClient from "./ui/EditBusinessClient";

type Params = {
  lang: Locale;
  id: string;
};

/* ---------- Metadata ---------- */

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { lang: raw, id } = await params;
  const lang = isLocale(raw) ? raw : "en";

  const title =
    lang === "nl"
      ? "Bedrijf bewerken | Guide Me ABC"
      : "Edit business | Guide Me ABC";

  const description =
    lang === "nl"
      ? "Pas de gegevens van je bedrijfsvermelding aan."
      : "Edit the details of your business listing.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/business/edit/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `/${lang}/business/edit/${id}`,
    },
  };
}

/* ---------- Page ---------- */

export default async function BusinessEditPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "en";

  return <EditBusinessClient lang={lang} />;
}