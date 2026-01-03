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

function SubStatusBadge({ v }: { v: "active" | "inactive" | null | undefined }) {
  if (!v) return null;
  const cls =
    v === "active"
      ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
      : "bg-slate-500/15 text-slate-700 border-slate-500/30";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {v === "active" ? "Subscription active" : "Subscription inactive"}
    </span>
  );
}

export default async function BusinessesPage({ params, searchParams }: PageProps) {
  const { lang: rawLang } = await params;
  const lang: Locale = isLocale(rawLang) ? (rawLang as Locale) : "en";

  const sp = await searchParams;
  const islandFilter = normalizeIsland(firstParam(sp.island));
  const t = getBusinessesCopy(lang);

  const { data, error } = await fetchBusinesses(islandFilter);

  const safeData = Array.isArray(data) ? data : [];

  const listings = safeData.slice().sort((a, b) => {
    const planA: Plan = (a.subscription_plan ?? "free") as Plan;
    const planB: Plan = (b.subscription_plan ?? "free") as Plan;

    const rankDiff = PLAN_RANK[planA] - PLAN_RANK[planB];
    if (rankDiff !== 0) return rankDiff;

    return String(a.business_name ?? "").localeCompare(String(b.business_name ?? ""));
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-bold mb-3 text-title-gradient text-pop-shadow">
          {t.heading}
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          {t.sub}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-10 flex flex-wrap items-center gap-2">
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

      {/* States */}
      {error ? (
        <p className="text-destructive">Error: {error.message}</p>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-muted/30 p-8">
          <p className="text-muted-foreground">{t.empty}</p>
        </div>
      ) : (
        <>
          {/* Subtle top helper bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              {listings.length} {listings.length === 1 ? "bedrijf" : "bedrijven"}
              {islandFilter ? ` • ${ISLAND_LABELS[islandFilter]}` : ""}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((b) => {
              const plan: Plan = (b.subscription_plan ?? "free") as Plan;

              // ✅ Synchroon met subscriptions: pro + active
              const hasMiniSite = plan === "pro" && b.subscription_status === "active";

              const href = `/${lang}/biz/${b.id}`;

              return (
                <Card
                  key={b.id}
                  className="overflow-hidden border border-border/60 bg-background/70 backdrop-blur shadow-[0_10px_35px_rgba(0,0,0,0.08)] transition-transform duration-200 hover:-translate-y-1"
                >
                  {/* Top media/cover */}
                  <div className="relative">
                    {b.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={b.cover_image_url}
                        alt={b.business_name}
                        className="h-36 w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-36 w-full bg-gradient-to-r from-sky-500/25 via-cyan-400/20 to-emerald-400/15" />
                    )}

                    {/* Floating badges */}
                    <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                      <Badge className="bg-black/55 text-white border-white/15">
                        {ISLAND_LABELS[b.island]}
                      </Badge>
                      <Badge className={PLAN_BADGE_CLASS[plan]}>
                        {PLAN_LABEL[plan]}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    {/* Logo + title */}
                    <div className="flex items-start gap-4 mb-3">
                      <div className="h-12 w-12 shrink-0 rounded-xl border border-border/60 bg-white/60 flex items-center justify-center overflow-hidden">
                        {b.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={b.logo_url}
                            alt={b.business_name}
                            className="h-full w-full object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-muted-foreground">
                            LOGO
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-lg leading-tight truncate">
                          {b.business_name}
                        </h3>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {b.categories?.name ?? "—"}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {b.description ? (
                      <p className="text-sm text-foreground/80 mb-4 line-clamp-3">
                        {b.description}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground mb-4">
                        —
                      </p>
                    )}

                    {/* Subscription badge line */}
                    <div className="mb-4">
                      <SubStatusBadge v={b.subscription_status ?? null} />
                    </div>

                    {/* CTA */}
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
                      {hasMiniSite ? <Link href={href}>{t.view}</Link> : <span>{t.noMini}</span>}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}