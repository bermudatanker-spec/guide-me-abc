// app/[lang]/business/auth/page.tsx
import { isLocale, type Locale } from "@/i18n/config";
import AuthClient from "./ui/AuthClient";

export const dynamic = "force-dynamic";

type Params = { lang: string };
type PageProps = { params: Promise<Params> };

export default async function BusinessAuthPage({ params }: PageProps) {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "en";

  return <AuthClient lang={lang} />;
}