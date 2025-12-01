// app/[lang]/businesses/page.tsx
import { isLocale, type Locale } from "@/i18n/config";
import { supabaseServer } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/* ----------------------------- Types ----------------------------- */

type SubscriptionPlan = "free" | "starter" | "growth" | "pro" | null;
type Plan = Exclude<SubscriptionPlan, null>;
type Island = "aruba" | "bonaire" | "curacao";
type Status = "pending" | "active" | "inactive" | null;

type Row = {
  id: string;
  business_name: string;
  description: string | null;
  island: Island;
  category_id: number | null;
  categories: { name: string; slug: string } | null;
  logo_url: string | null;
  cover_image_url: string | null;
  subscription_plan: SubscriptionPlan;
  status: Status;
};

// In Next 16 zijn params & searchParams Promises
type PageProps = {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ island?: string }> | { island?: string };
};

/* --------------------- Plan labels & styles ---------------------- */

const PLAN_LABEL: Record<Plan, string> = {
  free: "Free",
  starter: "Starter",
  growth: "Growth",
  pro: "Pro",
};

const PLAN_BADGE_CLASS: Record<Plan, string> = {
  free: "bg-slate-600 text-slate-50",
  starter: "bg-sky-600 text-sky-50",
  growth: "bg-emerald-600 text-emerald-50",
  pro: "bg-primary text-primary-foreground",
};

// ranking: pro > growth > starter > free
const PLAN_RANK: Record<Plan, number> = {
  pro: 0,
  growth: 1,
  starter: 2,
  free: 3,
};

/* --------------------- Island labels & helpers ------------------- */

const ISLAND_LABELS: Record<Island, string> = {
  aruba: "Aruba",
  bonaire: "Bonaire",
  curacao: "Curaçao",
};

const VALID_ISLANDS: Island[] = ["aruba", "bonaire", "curacao"];

/* ----------------------------- Page ------------------------------ */

export default async function BusinessesPage({
  params,
  searchParams,
}: PageProps) {
  // params / searchParams eerst "unwrappen"
  const resolvedParams = await params;
  const resolvedSearch =
    (await Promise.resolve(searchParams)) as { island?: string } | undefined;

  const lang = isLocale(resolvedParams.lang) ? resolvedParams.lang : "en";

  // island filter from URL (?island=aruba)
  const rawIsland = (resolvedSearch?.island ?? "").toLowerCase().trim();
  const islandFilter = VALID_ISLANDS.includes(rawIsland as Island)
    ? (rawIsland as Island)
    : null;

  const s = await supabaseServer();

  let query = s
    .from("business_listings")
    .select(
      `
      id,
      business_name,
      description,
      island,
      category_id,
      categories:category_id ( name, slug ),
      logo_url,
      cover_image_url,
      subscription_plan,
      status
    `
    )
    .eq("status", "active");

  if (islandFilter) {
    query = query.eq("island", islandFilter);
  }

  const { data, error } = await query.returns<Row[]>();

  // PRO > Growth > Starter > Free, binnen elke groep A–Z op naam
  const listings: Row[] = (data ?? []).slice().sort((a, b) => {
    const planA: Plan = (a.subscription_plan ?? "free") as Plan;
    const planB: Plan = (b.subscription_plan ?? "free") as Plan;

    const rankDiff = PLAN_RANK[planA] - PLAN_RANK[planB];
    if (rankDiff !== 0) return rankDiff;

    return a.business_name.localeCompare(b.business_name);
  });

  const t = {
    heading:
      lang === "nl"
        ? "Ontdek Bedrijven"
        : lang === "pap"
        ? "Deskubri Negoshinan"
        : lang === "es"
        ? "Descubre Negocios"
        : "Discover Businesses",
    sub:
      lang === "nl"
        ? "Browse lokale bedrijven op de ABC-eilanden"
        : lang === "pap"
        ? "Eksplora negoshinan lokal riba e Islanan ABC"
        : lang === "es"
        ? "Explora negocios locales en las Islas ABC"
        : "Browse local businesses across the ABC Islands",
    allIslands:
      lang === "nl"
        ? "Alle eilanden"
        : lang === "pap"
        ? "Tur isla"
        : lang === "es"
        ? "Todas las islas"
        : "All islands",
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 text-foreground">
          {t.heading}
        </h1>
        <p className="text-muted-foreground">{t.sub}</p>
      </div>

      {/* Island filter bar */}
      <div className="mb-8 flex flex-wrap gap-2">
        <FilterChip
          href={`/${lang}/businesses`}
          active={!islandFilter}
          label={t.allIslands}
        />
        {VALID_ISLANDS.map((isl) => (
          <FilterChip
            key={isl}
            href={`/${lang}/businesses?island=${isl}`}
            active={isl === islandFilter}
            label={ISLAND_LABELS[isl]}
          />
        ))}
      </div>

      {/* Data states */}
      {error ? (
        <p className="text-destructive">Error: {error.message}</p>
      ) : listings.length === 0 ? (
        <p className="text-muted-foreground">
          {lang === "nl"
            ? "Nog geen actieve bedrijven in deze selectie."
            : "No active businesses published yet for this selection."}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((b) => {
            const plan: Plan = (b.subscription_plan ?? "free") as Plan;
            const hasMiniSite = plan === "pro";
            const href = `/${lang}/biz/${b.id}`;

            return (
              <Card
                key={b.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  {b.logo_url && (
                    <div className="mb-4 h-32 flex items-center justify-center bg-muted rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={b.logo_url}
                        alt={b.business_name}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  )}

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

                  {b.description && (
                    <p className="text-sm text-foreground/80 mb-4 line-clamp-2">
                      {b.description}
                    </p>
                  )}

                  <Button
                    variant={hasMiniSite ? "outline" : "ghost"}
                    size="sm"
                    className="w-full"
                    disabled={!hasMiniSite}
                    asChild={hasMiniSite}
                  >
                    {hasMiniSite ? (
                      <Link href={href}>
                        {lang === "nl" ? "Bekijk details" : "View details"}
                      </Link>
                    ) : (
                      <span>
                        {lang === "nl" ? "Geen mini-site" : "No mini-site"}
                      </span>
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

/* ------------------------- Small helper chip --------------------- */

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-foreground hover:bg-muted",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}