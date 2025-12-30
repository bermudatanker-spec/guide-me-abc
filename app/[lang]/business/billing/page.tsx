// app/[lang]/business/billing/page.tsx
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import BillingClient from "./ui/BillingClient";

type Params = { lang: Locale };
type Props = { params: Promise<Params> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "en";
  const isNl = lang === "nl";

  return {
    title: isNl ? "Pakketten & betaling | Guide Me ABC" : "Plans & billing | Guide Me ABC",
    description: isNl
      ? "Kies een pakket en beheer je abonnement."
      : "Choose a plan and manage your subscription.",
  };
}

export default async function BillingPage({ params }: Props) {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "en";
  return <BillingClient lang={lang} />;
}