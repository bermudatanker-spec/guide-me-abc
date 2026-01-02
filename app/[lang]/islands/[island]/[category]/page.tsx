// app/[lang]/islands/[island]/[category]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

/* ---------- Types ---------- */

type Lang = "en" | "nl" | "pap" | "es";
type IslandId = "aruba" | "bonaire" | "curacao";
type CategorySlug =
  | "shops"
  | "activities"
  | "car-rentals"
  | "restaurants"
  | "services"
  | "real-estate";

type SubscriptionPlan = "free" | "starter" | "growth" | "pro" | null;
type Plan = Exclude<SubscriptionPlan, null>;

type Row = {
  id: string;
  business_name: string;
  description: string | null;
  island: IslandId;
  category_id: number | null;
  categories: { name: string; slug: CategorySlug } | null;
  logo_url: string | null;
  cover_image_url: string | null;
  subscription_plan: SubscriptionPlan;
  status: "pending" | "active" | "inactive" | null;
};

/* ---------- Whitelists ---------- */

const VALID_LANGS: Lang[] = ["en", "nl", "pap", "es"];
const VALID_ISLANDS: IslandId[] = ["aruba", "bonaire", "curacao"];
const VALID_CATEGORIES: CategorySlug[] = [
  "shops",
  "activities",
  "car-rentals",
  "restaurants",
  "services",
  "real-estate",
];

/* ---------- Labels & copy ---------- */

const ISLAND_LABELS: Record<IslandId, string> = {
  aruba: "Aruba",
  bonaire: "Bonaire",
  curacao: "Curaçao",
};

const CATEGORY_LABELS: Record<
  CategorySlug,
  {
    en: { title: string; description: string };
    nl: { title: string; description: string };
    pap: { title: string; description: string };
    es: { title: string; description: string };
  }
> = {
  shops: {
    en: {
      title: "Shops & Local Boutiques",
      description:
        "Discover local stores, artisan boutiques and small businesses on the island.",
    },
    nl: {
      title: "Winkels & boetieks",
      description:
        "Ontdek lokale winkels, boetieks en kleine ondernemers op het eiland.",
    },
    pap: {
      title: "Tienda & boetík lokal",
      description:
        "Deskubrí tienda lokal, boetík i negoshinan chikí riba e isla.",
    },
    es: {
      title: "Tiendas y boutiques locales",
      description:
        "Descubre tiendas locales, boutiques artesanales y pequeños negocios en la isla.",
    },
  },
  activities: {
    en: {
      title: "Tours & Activities",
      description:
        "Snorkeling, diving, boat trips, hikes and other island adventures.",
    },
    nl: {
      title: "Tours & activiteiten",
      description:
        "Snorkelen, duiken, boottours, hikes en andere eilandavonturen.",
    },
    pap: {
      title: "Tour & aktividat",
      description:
        "Snòrkel, buseá, trip na barku, hike i otro aventura riba e isla.",
    },
    es: {
      title: "Tours y actividades",
      description:
        "Snorkel, buceo, paseos en barco, caminatas y más aventuras en la isla.",
    },
  },
  "car-rentals": {
    en: {
      title: "Car Rentals",
      description:
        "Find jeeps, SUVs and cars to explore the island at your own pace.",
    },
    nl: {
      title: "Autoverhuur",
      description:
        "Vind jeeps, SUV’s en auto’s om het eiland in je eigen tempo te ontdekken.",
    },
    pap: {
      title: "Hür di auto",
      description:
        "Hür jeep, SUV of outo pa eksplorá e isla na bo propio tempu.",
    },
    es: {
      title: "Alquiler de autos",
      description:
        "Encuentra jeeps, SUVs y autos para recorrer la isla a tu propio ritmo.",
    },
  },
  restaurants: {
    en: {
      title: "Restaurants & Food",
      description:
        "From street food to fine dining, explore the island’s food scene.",
    },
    nl: {
      title: "Restaurants & eten",
      description:
        "Van streetfood tot fine dining, ontdek de culinaire kant van het eiland.",
    },
    pap: {
      title: "Restoran & kuminda",
      description:
        "For di kuminda di kaya te restoran luho, eksplorá e kulinario di e isla.",
    },
    es: {
      title: "Restaurantes y comida",
      description:
        "Desde comida callejera hasta alta cocina, explora la gastronomía de la isla.",
    },
  },
  services: {
    en: {
      title: "Local Services",
      description:
        "Guides, wellness, transport and other useful services for your stay.",
    },
    nl: {
      title: "Lokale services",
      description:
        "Gidsen, wellness, transport en andere handige services tijdens je verblijf.",
    },
    pap: {
      title: "Servisionan lokal",
      description:
        "Guia, bienestar, transport i otro servisio útil pa bo estadía.",
    },
    es: {
      title: "Servicios locales",
      description:
        "Guías, bienestar, transporte y otros servicios útiles para tu estadía.",
    },
  },
  "real-estate": {
    en: {
      title: "Real Estate & Rentals",
      description:
        "Holiday rentals, long-stay apartments and properties for sale.",
    },
    nl: {
      title: "Vastgoed & verhuur",
      description:
        "Vakantieverhuur, long-stay appartementen en koopwoningen op het eiland.",
    },
    pap: {
      title: "Propiedat & huur",
      description:
        "Hür pa vakashon, long-stay apartament i kas pa kumpra riba e isla.",
    },
    es: {
      title: "Bienes raíces y alquileres",
      description:
        "Alquiler vacacional, estancias largas y propiedades en venta.",
    },
  },
};

/* ---------- Plan badges (zelfde als /businesses) ---------- */

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

const PLAN_ORDER: Record<Plan, number> = {
  pro: 0,
  growth: 1,
  starter: 2,
  free: 3,
};

/* ---------- Params type (Next 16 = Promise) ---------- */

type PageParams = {
  params: Promise<{
    lang: string;
    island: string;
    category: string;
  }>;
};

/* ---------- Page ---------- */

export default async function IslandCategoryPage({ params }: PageParams) {
  // params uitpakken (is een Promise in Next 16)
  const raw = await params;

  const rawLang = (raw.lang ?? "").toLowerCase();
  const rawIsland = (raw.island ?? "").toLowerCase().trim();
  const rawCategory = (raw.category ?? "").toLowerCase().trim();

  const lang: Lang = VALID_LANGS.includes(rawLang as Lang)
    ? (rawLang as Lang)
    : "en";

  const island = rawIsland as IslandId;
  const category = rawCategory as CategorySlug;

  // URL-guard: als iets niet klopt → 404
  if (!VALID_ISLANDS.includes(island) || !VALID_CATEGORIES.includes(category)) {
    notFound();
  }

  const islandLabel = ISLAND_LABELS[island];
  const catCopy = CATEGORY_LABELS[category][lang];

  const s = await createSupabaseServerClient();

  const { data, error } = await s
    .from("business_listings")
    .select(
      `
      id,
      business_name,
      description,
      island,
      category_id,
      categories:category_id!inner (
        name,
        slug
      ),
      logo_url,
      cover_image_url,
      subscription_plan,
      is_verified,
      verified_at,
      status
    `
    )
    .eq("status", "active")
    .eq("island", island)
    // hier filteren we echt op categorie-slug
    .eq("categories.slug", category)
    .returns<Row[]>();

  // sorteren op plan (Pro → Growth → Starter → Free) en dan naam
  const listings = (data ?? []).slice().sort((a, b) => {
    const aPlan = (a.subscription_plan ?? "free") as Plan;
    const bPlan = (b.subscription_plan ?? "free") as Plan;

    const byPlan = PLAN_ORDER[aPlan] - PLAN_ORDER[bPlan];
    if (byPlan !== 0) return byPlan;

    return a.business_name.localeCompare(b.business_name);
  });

  return (
    <div className="min-h-screen container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      {/* Header */}
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wide text-teal-600">
          {islandLabel} • {category}
        </p>
        <h1 className="text-3xl font-bold text-foreground">{catCopy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          {catCopy.description}
        </p>
      </header>

      {/* Error / geen data */}
      {error ? (
        <p className="text-destructive">Error: {error.message}</p>
      ) : listings.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-sm text-slate-700">
          <p className="font-semibold mb-2">
            Listings coming soon / Binnenkort beschikbaar
          </p>
          <p className="mb-3">
            We zijn nog lokale bedrijven aan het onboarden in deze categorie.
            Bezoek later opnieuw of bekijk andere categorieën en tips voor{" "}
            <Link
              href={`/${lang}/islands/${island}`}
              className="text-teal-600 font-semibold underline-offset-4 hover:underline"
            >
              {islandLabel}
            </Link>
            .
          </p>
        </section>
      ) : (
        // Zelfde kaart-stijl als /businesses
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((b) => {
            const plan = (b.subscription_plan ?? "free") as Plan;
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
                    {islandLabel} • {b.categories?.name ?? "—"}
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
        </section>
      )}
    </div>
  );
}