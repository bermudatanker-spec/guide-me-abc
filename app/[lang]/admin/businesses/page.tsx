import type { Locale } from "@/i18n/config";
import AdminBusinessesClient from "./ui/AdminBusinessesClient";
import { requireSuperAdmin } from "@/lib/auth/requireSuperAdmin";

type PageProps = {
  params: Promise<{ lang: Locale }>;
};

export default async function AdminBusinessesPage({ params }: PageProps) {
  const { lang } = await params;

  // extra server-guard (middleware doet het al, maar dit is veilig)
  await requireSuperAdmin(lang);

  return <AdminBusinessesClient lang={lang} t={{}} />;
}