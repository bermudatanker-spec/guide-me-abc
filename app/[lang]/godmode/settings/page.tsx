// app/[lang]/godmode/settings/page.tsx
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import SettingsClient from "./ui/SettingsClient";

type Params = { lang: Locale };
type Props = { params: Promise<Params> };

// --------- SEO ---------
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "en";
  const isNl = lang === "nl";

  return {
    title: isNl
      ? "Platform instellingen | God Mode | Guide Me ABC"
      : "Platform settings | God Mode | Guide Me ABC",
    description: isNl
      ? "Beheer globale platforminstellingen, AI-limieten en moderatie in God Mode."
      : "Manage global platform settings, AI limits and moderation in God Mode.",
  };
}

// --------- PAGE ---------
export default async function SuperSettingsPage({ params }: Props) {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "en";

  // Alle data loaden we client-side via Supabase; hier alleen de shell
  return <SettingsClient lang={lang} />;
}