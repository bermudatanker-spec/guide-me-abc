import type { Locale } from "@/i18n/config";
import AdminBusinessesClient from "./ui/AdminBusinessesClient";

type PageProps = {
  params: Promise<{ lang: Locale }>;
};

export const dynamic = "force-dynamic";

export default async function AdminBusinessesPage({ params }: PageProps) {
  const { lang } = await params;
  return <AdminBusinessesClient lang={lang} />;
}