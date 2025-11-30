// app/[lang]/islands/[island]/[category]/page.tsx
import Link from "next/link";
import { isLocale, type Locale } from "@/i18n/config";

export const dynamic = "force-dynamic";

type Lang = Locale;
type IslandId = "aruba" | "bonaire" | "curacao";
type CategorySlug =
  | "shops"
  | "activities"
  | "car-rentals"
  | "restaurants"
  | "services"
  | "real-estate";

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
        "Deskubrí tienda lokal, boetík i chikí negoshinan riba e isla.",
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
        "Snòrkel, buseo, trip na barku, hike i otro aventura riba e isla.",
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
        "Hür jeep, SUV of auto pa eksplorá e isla na bo propio tempo.",
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
        "For di street food te fine dining, eksplorá e kulinario di e isla.",
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
        "Guia, bienestar, transport i otro servisio útil pa bo estadia.",
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
        "Hür pa vakashon, long-stay apartamentu i kas pa kumpra riba e isla.",
    },
    es: {
      title: "Bienes raíces y alquileres",
      description:
        "Alquiler vacacional, estancias largas y propiedades en venta.",
    },
  },
};

type PageParams = {
  params: {
    lang: string;
    island: string;
    category: string;
  };
};

export default function IslandCategoryPage({ params }: PageParams) {
  // 1) taal normaliseren
  const lang: Lang = isLocale(params.lang as Lang) ? (params.lang as Lang) : "en";

  // 2) eiland + categorie gewoon vertrouwen, met fallbacks
  const island = params.island as IslandId;
  const category = params.category as CategorySlug;

  const islandLabel = ISLAND_LABELS[island] ?? params.island;
  const categoryConfig =
    CATEGORY_LABELS[category] ?? CATEGORY_LABELS["shops"]; // fallback als slug raar is
  const catCopy = categoryConfig[lang];

  return (
    <div className="min-h-screen container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wide text-teal-600">
          {islandLabel} • {category}
        </p>
        <h1 className="text-3xl font-bold text-slate-900">{catCopy.title}</h1>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl">
          {catCopy.description}
        </p>
      </header>

      {/* Placeholder tot Supabase listings live zijn */}
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
    </div>
  );
}