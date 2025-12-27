// app/[lang]/auth/login/page.tsx
import type { Locale } from "@/i18n/config";
import LoginClient from "./LoginClient";

type PageProps = {
  params: Promise<{ lang: string }>; // ✅ Change to Promise
};

export const dynamic = "force-dynamic";

export default async function LoginPage({ params }: PageProps) {
  const { lang } = await params; // ✅ Always await params
  return <LoginClient lang={lang as Locale} />;
}