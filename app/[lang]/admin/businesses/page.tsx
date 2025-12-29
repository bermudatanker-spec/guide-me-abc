import type { Locale } from "@/i18n/config";
import AdminBusinessesClient from "./ui/AdminBusinessesClient";

type PageProps = {
  params: Promise<{ lang: Locale }>;
};

export default async function AdminBusinessesPage({ params }: PageProps) {
  const { lang } = await params;

  const t: Record<string, string> = {}
  
  return <AdminBusinessesClient lang={lang} t={t} />;
}