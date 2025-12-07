// app/[lang]/account/page.tsx
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import AccountClient from "./AccountClient"; // 👈 zelfde map, geen /ui

type PageParams = { lang: Locale };
type PageProps = { params: Promise<PageParams> };

// ----------- SEO -----------
export async function generateMetadata(
  props: PageProps
): Promise<Metadata> {
  const { lang: raw } = await props.params;
  const lang = isLocale(raw) ? raw : "en";

  return {
    title:
      lang === "nl"
        ? "Mijn account | Guide Me ABC"
        : "My Account | Guide Me ABC",
    description:
      lang === "nl"
        ? "Beheer je account, bekijk je bedrijfsgegevens en log uit."
        : "Manage your account, view business info and logout.",
  };
}

// ----------- PAGE -----------
export default async function AccountPage({ params }: PageProps) {
  const { lang: raw } = await params; // ✅ params is een Promise in Next 16
  const lang = isLocale(raw) ? raw : "en";

  return <AccountClient lang={lang} />;
}