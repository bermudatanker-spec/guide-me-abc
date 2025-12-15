import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { langHref } from "@/lib/lang-href";
import { getCapabilities } from "@/lib/plans/capabilities";
import { getMyBusiness } from "@/lib/business/getMyBusiness";
import DashboardHome from "./ui/DashboardHome";

export const dynamic = "force-dynamic";

type Params = { lang: string };
type PageProps = { params: Promise<Params> };

export default async function DashboardPage({ params }: PageProps) {
  const { lang: rawLang } = await params;
  const lang: Locale = isLocale(rawLang) ? (rawLang as Locale) : "en";

  const { userId, business } = await getMyBusiness();

  if (!userId) {
    redirect(langHref(lang, "/business/auth"));
  }

  // Nog geen business record? stuur naar create flow (maken we zo)
  if (!business) {
    redirect(langHref(lang, "/business/create"));
  }

  const caps = getCapabilities(business.plan);

  return <DashboardHome lang={lang} business={business} caps={caps} />;
}
