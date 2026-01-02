// app/[lang]/businesses/page.tsx
import Link from "next/link";
import { isLocale, type Locale } from "@/i18n/config";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  ISLAND_LABELS,
  PLAN_BADGE_CLASS,
  PLAN_LABEL,
  PLAN_RANK,
  VALID_ISLANDS,
  type Island,
  type Plan,
} from "./_lib/constants";

import { getBusinessesCopy } from "./_lib/i18n";
import { fetchBusinesses } from "./_lib/query";
import { FilterChip } from "./_components/filter-chip";

type PageProps = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function normalizeIsland(v: string | undefined): Island | null {
  const raw = (v ?? "").toLowerCase().trim();
  return VALID_ISLANDS.includes(raw as Island) ? (raw as Island) : null;
}

export default async function BusinessesPage({ params, searchParams }: PageProps) {
  const { lang: rawLang } = await params;
  const lang: Locale = isLocale(rawLang) ? (rawLang as Locale) : "en";

  const sp = await searchParams;

  const islandFilter = normalizeIsland(firstParam(sp.island));
  const t = getBusinessesCopy(lang);

  const { data, error } = await fetchBusinesses(islandFilter);

  // ✅ Voorkomt runtime crash bij undefined/null data
  const safeData = Array.isArray(data) ? data : [];

  const listings = safeData.slice().sort((a, b) => {
    const planA: Plan = (a.subscription_plan ?? "free") as Plan;
    const planB: Plan = (b.subscription_plan ?? "free") as Plan;

    const rankDiff = PLAN_RANK[planA] - PLAN_RANK[planB];
    if (rankDiff !== 0) return rankDiff;

    // ✅ defensief (als business_name ooit undefined is)
    return String(a.business_name ?? "").localeCompare(String(b.business_name ?? ""));
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-4xl font-bold mb-2 text-title-gradient text-pop-shadow">
          {t.heading}
        </h1>
        <p className="text-muted-foreground">{t.sub}</p>
      </div>

      <div className="mb-10 flex flex-wrap gap-2">
        <FilterChip href={`/${lang}/businesses`} active={!islandFilter} label={t.allIslands} />

        {VALID_ISLANDS.map((isl) => (
          <FilterChip
            key={isl}
            href={`/${lang}/businesses?island=${isl}`}
            active={isl === islandFilter}
            label={ISLAND_LABELS[isl]}
          />
        ))}
      </div>

      {error ? (
        <p className="text-destructive">Error: {error.message}</p>
      ) : listings.length === 0 ? (
        <p className="text-muted-foreground">{t.empty}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((b) => {
            const plan: Plan = (b.subscription_plan ?? "free") as Plan;
            const subActive = b.subscription_status === "active";
            const hasMiniSite = plan === "pro" && subActive;

            const href = `/${lang}/biz/${b.id}`;

            return (
              <Card
                key={b.id}
                className="glass-card shadow-glow border-none transition-transform duration-200 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  {b.logo_url ? (
                    <div className="mb-4 h-32 flex items-center justify-center rounded-xl overflow-hidden bg-white/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={b.logo_url}
                        alt={b.business_name}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  ) : null}

                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3 className="font-bold text-lg text-foreground">
                      {b.business_name}
                    </h3>
                    <Badge className={PLAN_BADGE_CLASS[plan]}>
                      {PLAN_LABEL[plan]}
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground mb-3">
                    {ISLAND_LABELS[b.island]} • {b.categories?.name ?? "—"}
                  </div>

                  {b.description ? (
                    <p className="text-sm text-foreground/80 mb-4 line-clamp-2">
                      {b.description}
                    </p>
                  ) : null}

                  <Button
                    size="sm"
                    variant={hasMiniSite ? "default" : "outline"}
                    className={
                      hasMiniSite
                        ? "w-full rounded-full bg-ocean-btn button-gradient border-none"
                        : "w-full rounded-full"
                    }
                    disabled={!hasMiniSite}
                    asChild={hasMiniSite}
                  >
                    {hasMiniSite ? (
                      <Link href={href}>{t.view}</Link>
                    ) : (
                      <span>{t.noMini}</span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}