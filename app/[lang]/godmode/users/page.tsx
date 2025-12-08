// app/[lang]/godmode/users/page.tsx
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import SuperUsersClient from "./ui/SuperUsersClient";

type Params = { lang: string };
type Props = { params: Promise<Params> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "en";
  const isNl = lang === "nl";

  return {
    title: isNl
      ? "GodMode – Gebruikersbeheer"
      : "GodMode – User management",
    description: isNl
      ? "Beheer alle gebruikers, rollen en toegang tot Guide Me ABC."
      : "Manage all users, roles and access to Guide Me ABC.",
  };
}

export default async function Page({ params }: Props) {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "en";

  return <SuperUsersClient lang={lang} />;
}