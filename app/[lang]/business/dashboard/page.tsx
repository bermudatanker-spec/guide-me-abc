// app/[lang]/business/dashboard/page.tsx
import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { langHref } from "@/lib/lang-href";
import { getCapabilities } from "@/lib/plans/capabilities";
import { getMyBusiness } from "@/lib/business/getMyBusiness";
import DashboardHome from "./ui/DashboardHome";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = {
  params: { lang: string };
};

export default async function DashboardPage({ params }: PageProps) {
  const rawLang = params.lang;
  const lang: Locale = isLocale(rawLang) ? (rawLang as Locale) : "en";

  const { userId, business } = await getMyBusiness();

  if (!userId) redirect(langHref(lang, "/business/auth"));
  if (!business) redirect(langHref(lang, "/business/create"));

  const rawCaps = getCapabilities(business.plan) as Record<string, any>;

  const caps = {
    maxCategories: rawCaps.maxCategories ?? rawCaps.categories ?? 0,
    maxLocations: rawCaps.maxLocations ?? rawCaps.locations ?? 0,
    maxDeals: rawCaps.maxDeals ?? rawCaps.deals ?? 0,
    maxPhotos: rawCaps.maxPhotos ?? rawCaps.photos ?? 0,
    maxVideos: rawCaps.maxVideos ?? rawCaps.videos ?? 0,

    // Normaliseer naar één naam → voorkomt "rode kronkel"
    canMiniSite: Boolean(
      rawCaps.canMiniSite ??
        rawCaps.canMinisite ?? // typo-variant
        rawCaps.can_minisite ??
        rawCaps.miniSite ??
        rawCaps.canMiniSiteSettings ??
        rawCaps.canMiniSiteAccess ??
        false
    ),
  };

  return (
    <DashboardHome
      lang={lang}
      business={business}
      caps={caps}
    />
  );
}