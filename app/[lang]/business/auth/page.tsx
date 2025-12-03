// app/[lang]/business/auth/page.tsx
import type { Locale } from "@/i18n/config";
import AuthClient from "./ui/AuthClient";

type PageProps = {
  params: { lang: Locale };
};

export default function BusinessAuthPage({ params }: PageProps) {
  return <AuthClient lang={params.lang} />;
}