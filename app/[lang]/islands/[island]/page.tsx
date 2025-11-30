// app/[lang]/islands/[island]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ResponsiveImage from "@/components/ResponsiveImage";

type Lang = "en" | "nl" | "pap" | "es";
type IslandId = "aruba" | "bonaire" | "curacao";

const ISLANDS: readonly IslandId[] = ["aruba", "bonaire", "curacao"] as const;

const ISLAND_BG: Record<IslandId, string> = {
  aruba: "/images/aruba-island.jpg",
  bonaire: "/images/bonaire-island.jpg",
  curacao: "/images/curacao-island.jpg",
};

type Copy = {
  name: string;
  tagline: string;
  description: string;
  topTitle: string;
  topThings: string[];
  exploreByCategory: string;
  explore: string;
  categories: {
    slug:
      | "shops"
      | "activities"
      | "car-rentals"
      | "restaurants"
      | "services"
      | "real-estate";
    title: string;
    subtitle: string;
  }[];
};

const COPY: Record<Lang, Record<IslandId, Copy>> = {
  en: {
    aruba: {
      name: "Aruba",
      tagline: "One Happy Island",
      description:
        "Aruba blends turquoise waters, soft white-sand beaches, and a lively local culture. From Eagle Beach and Arikok National Park to colorful Oranjestad and the hidden Natural Pool, the island offers a perfect mix of relaxation and adventure—year-round.",
      topTitle: "Top Things to Do in Aruba",
      topThings: [
        "Relax at Eagle Beach, one of the world's best beaches",
        "Hike or drive through Arikok National Park’s desert landscapes",
        "Snorkel the shallow reefs at Mangel Halto",
        "Catch sunset views at the California Lighthouse",
        "Wander the colorful streets of Oranjestad",
        "Go off-road to Conchi, the Natural Pool",
      ],
      exploreByCategory: "Explore by Category",
      explore: "Explore",
      categories: [
        {
          slug: "shops",
          title: "Shops",
          subtitle: "Local boutiques & stores",
        },
        {
          slug: "activities",
          title: "Activities",
          subtitle: "Tours & experiences",
        },
        {
          slug: "car-rentals",
          title: "Car Rentals",
          subtitle: "Rent a vehicle",
        },
        {
          slug: "restaurants",
          title: "Restaurants",
          subtitle: "Dining & cuisine",
        },
        {
          slug: "services",
          title: "Services",
          subtitle: "Professional services",
        },
        {
          slug: "real-estate",
          title: "Real Estate",
          subtitle: "Commercial & homes",
        },
      ],
    },
    bonaire: {
      name: "Bonaire",
      tagline: "Diver’s Paradise",
      description:
        "Bonaire is world-renowned for pristine reefs, calm trade winds, and a relaxed island rhythm. Shore diving, windsurfing at Lac Bay, and flamingos at the salt flats make it a nature lover’s dream.",
      topTitle: "Top Things to Do in Bonaire",
      topThings: [
        "Shore dive iconic 1000 Steps",
        "Windsurf or kitesurf at Lac Bay",
        "Explore Washington Slagbaai National Park",
        "Spot flamingos near the salt flats",
        "Snorkel at Klein Bonaire",
        "Stroll the colorful streets of Kralendijk",
      ],
      exploreByCategory: "Explore by Category",
      explore: "Explore",
      categories: [
        {
          slug: "shops",
          title: "Shops",
          subtitle: "Local boutiques & stores",
        },
        {
          slug: "activities",
          title: "Activities",
          subtitle: "Diving, tours & more",
        },
        {
          slug: "car-rentals",
          title: "Car Rentals",
          subtitle: "Jeeps, trucks, cars",
        },
        {
          slug: "restaurants",
          title: "Restaurants",
          subtitle: "Local & international",
        },
        {
          slug: "services",
          title: "Services",
          subtitle: "Guides & amenities",
        },
        {
          slug: "real-estate",
          title: "Real Estate",
          subtitle: "Invest & rentals",
        },
      ],
    },
    curacao: {
      name: "Curaçao",
      tagline: "Colorful Caribbean",
      description:
        "Curaçao charms with pastel-hued Willemstad, hidden coves, and rich culture. From Playa Kenepa to Christoffel National Park and the Hato Caves, every corner invites exploration.",
      topTitle: "Top Things to Do in Curaçao",
      topThings: [
        "Stroll the UNESCO-listed center of Willemstad",
        "Swim at Playa Kenepa (Grote Knip)",
        "Hike Christoffelberg at sunrise",
        "Discover ancient formations at Hato Caves",
        "Snorkel the Blue Room sea cave",
        "Enjoy nightlife and dining at Pietermaai",
      ],
      exploreByCategory: "Explore by Category",
      explore: "Explore",
      categories: [
        {
          slug: "shops",
          title: "Shops",
          subtitle: "Local boutiques & crafts",
        },
        {
          slug: "activities",
          title: "Activities",
          subtitle: "Tours & adventures",
        },
        {
          slug: "car-rentals",
          title: "Car Rentals",
          subtitle: "Rent a vehicle",
        },
        {
          slug: "restaurants",
          title: "Restaurants",
          subtitle: "Cuisine & cocktails",
        },
        {
          slug: "services",
          title: "Services",
          subtitle: "Professional services",
        },
        {
          slug: "real-estate",
          title: "Real Estate",
          subtitle: "Homes & investments",
        },
      ],
    },
  },

  nl: {
    aruba: {
      name: "Aruba",
      tagline: "One Happy Island",
      description:
        "Aruba combineert turkooizen zee, poederzachte stranden en een levendige cultuur. Van Eagle Beach en het Arikok Nationaal Park tot het kleurrijke Oranjestad en de verborgen Natural Pool: het eiland biedt een perfecte mix van ontspanning en avontuur.",
      topTitle: "Top dingen om te doen op Aruba",
      topThings: [
        "Geniet op Eagle Beach, een van de mooiste stranden ter wereld",
        "Verken het woestijnlandschap van Arikok Nationaal Park",
        "Snorkel bij het ondiepe rif van Mangel Halto",
        "Bekijk de zonsondergang bij de California-vuurtoren",
        "Struin door de kleurrijke straten van Oranjestad",
        "Rijd off-road naar Conchi (Natural Pool)",
      ],
      exploreByCategory: "Ontdek per categorie",
      explore: "Bekijk",
      categories: [
        {
          slug: "shops",
          title: "Shops",
          subtitle: "Lokale boetieks & winkels",
        },
        {
          slug: "activities",
          title: "Activiteiten",
          subtitle: "Tours & experiences",
        },
        {
          slug: "car-rentals",
          title: "Autoverhuur",
          subtitle: "Huur een voertuig",
        },
        {
          slug: "restaurants",
          title: "Restaurants",
          subtitle: "Eten & drinken",
        },
        {
          slug: "services",
          title: "Services",
          subtitle: "Professionele diensten",
        },
        {
          slug: "real-estate",
          title: "Vastgoed",
          subtitle: "Woningen & commercieel",
        },
      ],
    },
    bonaire: {
      name: "Bonaire",
      tagline: "Diver’s Paradise",
      description:
        "Bonaire staat bekend om zijn ongerepte riffen, constante passaatwind en relaxte eilandsfeer. Shore diving, windsurfen bij Lac Bay en flamingo’s bij de zoutpannen—een paradijs voor natuurliefhebbers.",
      topTitle: "Top dingen om te doen op Bonaire",
      topThings: [
        "Shore dive bij het iconische 1000 Steps",
        "(Wind)surfen bij Lac Bay",
        "Ontdek Washington Slagbaai Nationaal Park",
        "Spot flamingo’s bij de zoutpannen",
        "Snorkel rond Klein Bonaire",
        "Slenter door Kralendijk",
      ],
      exploreByCategory: "Ontdek per categorie",
      explore: "Bekijk",
      categories: [
        {
          slug: "shops",
          title: "Shops",
          subtitle: "Lokale boetieks & winkels",
        },
        {
          slug: "activities",
          title: "Activiteiten",
          subtitle: "Duiken, tours & meer",
        },
        {
          slug: "car-rentals",
          title: "Autoverhuur",
          subtitle: "Jeeps, pick-ups, auto's",
        },
        {
          slug: "restaurants",
          title: "Restaurants",
          subtitle: "Lokaal & internationaal",
        },
        {
          slug: "services",
          title: "Services",
          subtitle: "Gidsen & voorzieningen",
        },
        {
          slug: "real-estate",
          title: "Vastgoed",
          subtitle: "Investeren & huren",
        },
      ],
    },
    curacao: {
      name: "Curaçao",
      tagline: "Colorful Caribbean",
      description:
        "Curaçao betovert met pastelkleurig Willemstad, intieme baaien en rijke cultuur. Van Playa Kenepa en de Blue Room tot de Hato-grotten en de top van de Christoffelberg — hier valt altijd iets te ontdekken.",
      topTitle: "Top dingen om te doen op Curaçao",
      topThings: [
        "Dwaal door het UNESCO-centrum van Willemstad",
        "Zwem bij Playa Kenepa (Grote Knip)",
        "Beklim de Christoffelberg bij zonsopkomst",
        "Ontdek de Hato-grotten",
        "Snorkel in de Blue Room zeegrot",
        "Geniet van uitgaan & dineren in Pietermaai",
      ],
      exploreByCategory: "Ontdek per categorie",
      explore: "Bekijk",
      categories: [
        {
          slug: "shops",
          title: "Shops",
          subtitle: "Boetieks & ambacht",
        },
        {
          slug: "activities",
          title: "Activiteiten",
          subtitle: "Tours & avontuur",
        },
        {
          slug: "car-rentals",
          title: "Autoverhuur",
          subtitle: "Huur een voertuig",
        },
        {
          slug: "restaurants",
          title: "Restaurants",
          subtitle: "Keuken & cocktails",
        },
        {
          slug: "services",
          title: "Services",
          subtitle: "Professionele diensten",
        },
        {
          slug: "real-estate",
          title: "Vastgoed",
          subtitle: "Wonen & investeren",
        },
      ],
    },
  },

  es: {
    aruba: {
      name: "Aruba",
      tagline: "One Happy Island",
      description:
        "Aruba combina aguas turquesa, playas de arena blanca y una cultura vibrante. Desde Eagle Beach y el Parque Nacional Arikok hasta Oranjestad y la piscina natural, el destino perfecto para relajarse y vivir aventuras todo el año.",
      topTitle: "Lo mejor que hacer en Aruba",
      topThings: [
        "Relájate en Eagle Beach",
        "Explora el Parque Nacional Arikok",
        "Haz snorkel en Mangel Halto",
        "Atardecer en el Faro California",
        "Camina por las calles coloridas de Oranjestad",
        "Off-road a Conchi (Natural Pool)",
      ],
      exploreByCategory: "Explorar por categoría",
      explore: "Explorar",
      categories: [
        {
          slug: "shops",
          title: "Tiendas",
          subtitle: "Boutiques y comercios",
        },
        {
          slug: "activities",
          title: "Actividades",
          subtitle: "Tours y experiencias",
        },
        {
          slug: "car-rentals",
          title: "Alquileres",
          subtitle: "Renta de vehículos",
        },
        {
          slug: "restaurants",
          title: "Restaurantes",
          subtitle: "Gastronomía",
        },
        {
          slug: "services",
          title: "Servicios",
          subtitle: "Servicios profesionales",
        },
        {
          slug: "real-estate",
          title: "Bienes raíces",
          subtitle: "Viviendas & inversión",
        },
      ],
    },
    bonaire: {
      name: "Bonaire",
      tagline: "Paraíso del buceo",
      description:
        "Famosa por sus arrecifes intactos y brisas constantes, Bonaire ofrece buceo de orilla, windsurf en Lac Bay y avistamiento de flamencos en salinas—un paraíso natural.",
      topTitle: "Lo mejor que hacer en Bonaire",
      topThings: [
        "Bucea en 1000 Steps",
        "Windsurf/kitesurf en Lac Bay",
        "Explora el Parque Washington Slagbaai",
        "Mira flamencos en las salinas",
        "Snorkel en Klein Bonaire",
        "Recorre Kralendijk",
      ],
      exploreByCategory: "Explorar por categoría",
      explore: "Explorar",
      categories: [
        {
          slug: "shops",
          title: "Tiendas",
          subtitle: "Boutiques y comercios",
        },
        {
          slug: "activities",
          title: "Actividades",
          subtitle: "Buceo, tours y más",
        },
        {
          slug: "car-rentals",
          title: "Alquileres",
          subtitle: "Jeeps, pick-ups, autos",
        },
        {
          slug: "restaurants",
          title: "Restaurantes",
          subtitle: "Local e internacional",
        },
        {
          slug: "services",
          title: "Servicios",
          subtitle: "Guías y servicios",
        },
        {
          slug: "real-estate",
          title: "Bienes raíces",
          subtitle: "Invertir & rentar",
        },
      ],
    },
    curacao: {
      name: "Curaçao",
      tagline: "Caribe colorido",
      description:
        "Curaçao encanta con Willemstad, sus calas escondidas y cultura diversa. De Playa Kenepa y Blue Room a las cuevas de Hato y el Parque Christoffel—¡a explorar!",
      topTitle: "Lo mejor que hacer en Curaçao",
      topThings: [
        "Pasea por el centro histórico de Willemstad",
        "Nada en Playa Kenepa (Grote Knip)",
        "Sube el Christoffel al amanecer",
        "Descubre las Cuevas de Hato",
        "Snorkel en la cueva Blue Room",
        "Vida nocturna en Pietermaai",
      ],
      exploreByCategory: "Explorar por categoría",
      explore: "Explorar",
      categories: [
        {
          slug: "shops",
          title: "Tiendas",
          subtitle: "Boutiques y artesanías",
        },
        {
          slug: "activities",
          title: "Actividades",
          subtitle: "Tours y aventuras",
        },
        {
          slug: "car-rentals",
          title: "Alquileres",
          subtitle: "Renta de vehículos",
        },
        {
          slug: "restaurants",
          title: "Restaurantes",
          subtitle: "Cocina & cocteles",
        },
        {
          slug: "services",
          title: "Servicios",
          subtitle: "Servicios profesionales",
        },
        {
          slug: "real-estate",
          title: "Bienes raíces",
          subtitle: "Vivienda & inversión",
        },
      ],
    },
  },

  pap: {
    aruba: {
      name: "Aruba",
      tagline: "One Happy Island",
      description:
        "Aruba ta kombiná laman turkesa, playa blanku suave i kultura bibu. For di Eagle Beach i Parque Nashonal Arikok te Oranjestad i e Natural Pool: relaks i aventurá tur aña.",
      topTitle: "Mihó kosnan pa hasi na Aruba",
      topThings: [
        "Relahá na Eagle Beach",
        "Eksplorá Parque Nashonal Arikok",
        "Snòrkel na Mangel Halto",
        "Mira atardi na Faro California",
        "Pasea den e kaya koló di Oranjestad",
        "Off-road te Conchi (Natural Pool)",
      ],
      exploreByCategory: "Eksplorá segun kategoria",
      explore: "Mira",
      categories: [
        {
          slug: "shops",
          title: "Tienda",
          subtitle: "Boetík i negoshi lokal",
        },
        {
          slug: "activities",
          title: "Aktividat",
          subtitle: "Tour i eksperiensha",
        },
        {
          slug: "car-rentals",
          title: "Hür auto",
          subtitle: "Hür un vehíkulo",
        },
        {
          slug: "restaurants",
          title: "Restoran",
          subtitle: "Kuminda i bebida",
        },
        {
          slug: "services",
          title: "Servisio",
          subtitle: "Servisionan profeshonal",
        },
        {
          slug: "real-estate",
          title: "Propiedat",
          subtitle: "Kas i komersio",
        },
      ],
    },
    bonaire: {
      name: "Boneiru",
      tagline: "Paraíso pa busadón",
      description:
        "Boneiru ta famá pa su rif limpinan den laman, bientu konsistente i ambiente trankil. Shore dive, windsurf na Lac Bay i flamingo na saliña—paraíso pa naturalesa.",
      topTitle: "Mihó kosnan pa hasi na Boneiru",
      topThings: [
        "Buska na 1000 Steps",
        "Windsurf/kitesurf na Lac Bay",
        "Eksplorá Parque Washington Slagbaai",
        "Wak flamingo na saliña",
        "Snòrkel na Klein Bonaire",
        "Paseá den Kralendijk",
      ],
      exploreByCategory: "Eksplorá segun kategoria",
      explore: "Mira",
      categories: [
        {
          slug: "shops",
          title: "Tienda",
          subtitle: "Boetík i negoshi lokal",
        },
        {
          slug: "activities",
          title: "Aktividat",
          subtitle: "Buseo, tour i mas",
        },
        {
          slug: "car-rentals",
          title: "Hür auto",
          subtitle: "Jeep, pickup, auto",
        },
        {
          slug: "restaurants",
          title: "Restoran",
          subtitle: "Lokal i internashonal",
        },
        {
          slug: "services",
          title: "Servisio",
          subtitle: "Guia i servisio",
        },
        {
          slug: "real-estate",
          title: "Propiedat",
          subtitle: "Invershon i huur",
        },
      ],
    },
    curacao: {
      name: "Kòrsou",
      tagline: "Karibe kolorí",
      description:
        "Kòrsou ta enkantá ku su Willemstad na koló pastel, bahíanan íntimo i kultura riku. For di Playa Kenepa i Blue Room te na Kueba di Hato i riba Seru Kristòfel — semper tin algu pa deskubrí aki.",
      topTitle: "Mehor kosnan pa hasi na Kòrsou",
      topThings: [
        "Paseá den sentro UNESCO di Willemstad",
        "Landa na Playa Kenepa (Grote Knip)",
        "Subi Seru Christoffel ora ku solo sali",
        "Deskubrí Hato Caves",
        "Snòrkel na Blue Room",
        "Disfrutá den Pietermaai",
      ],
      exploreByCategory: "Eksplorá segun kategoria",
      explore: "Mira",
      categories: [
        {
          slug: "shops",
          title: "Tienda",
          subtitle: "Boetík i artenan",
        },
        {
          slug: "activities",
          title: "Aktividat",
          subtitle: "Tour i aventura",
        },
        {
          slug: "car-rentals",
          title: "Hür auto",
          subtitle: "Hür un vehíkulo",
        },
        {
          slug: "restaurants",
          title: "Restoran",
          subtitle: "Kuminda & koktélnan",
        },
        {
          slug: "services",
          title: "Servisio",
          subtitle: "Servisionan profeshonal",
        },
        {
          slug: "real-estate",
          title: "Propiedat",
          subtitle: "Kasa i invershon",
        },
      ],
    },
  },
};

/* Category actions (labels + routes) */
const ACTION_LABELS = {
  shops: {
    primary: {
      en: "View all shops",
      nl: "Alle winkels",
      pap: "Tur tienda",
      es: "Ver todas las tiendas",
    },
    secondary: {
      en: "Local boutiques",
      nl: "Lokale boetieks",
      pap: "Boetík lokal",
      es: "Boutiques locales",
    },
    secondaryQuery: "tag=boutique",
  },
  activities: {
    primary: {
      en: "View activities",
      nl: "Activiteiten zien",
      pap: "Wak tur aktividad",
      es: "Ver actividades",
    },
    secondary: {
      en: "Top-rated tours",
      nl: "Best beoordeelde tours",
      pap: "Mihó Tournan evaluá ",
      es: "Tours mejor valorados",
    },
    secondaryQuery: "sort=rating_desc",
  },
  "car-rentals": {
    primary: {
      en: "See car rentals",
      nl: "Bekijk autoverhuur",
      pap: "Wak outo di hür",
      es: "Ver alquileres",
    },
    secondary: {
      en: "SUVs & Jeeps",
      nl: "SUV’s & Jeeps",
      pap: "SUV & Jeep",
      es: "SUVs y Jeeps",
    },
    secondaryQuery: "type=suv",
  },
  restaurants: {
    primary: {
      en: "Find restaurants",
      nl: "Vind restaurants",
      pap: "Haña restoran",
      es: "Buscar restaurantes",
    },
    secondary: {
      en: "Seafood nearby",
      nl: "Seafood dichtbij",
      pap: "Seafood serka",
      es: "Mariscos cerca",
    },
    secondaryQuery: "cuisine=seafood",
  },
  services: {
    primary: {
      en: "All services",
      nl: "Alle services",
      pap: "Tur servisio",
      es: "Todos los servicios",
    },
    secondary: {
      en: "Tour guides",
      nl: "Gidsen",
      pap: "Guíanan di tour",
      es: "Guías turísticos",
    },
    secondaryQuery: "type=guide",
  },
  "real-estate": {
    primary: {
      en: "Browse listings",
      nl: "Bekijk aanbod",
      pap: "Wak ofertanan",
      es: "Ver propiedades",
    },
    secondary: {
      en: "Holiday rentals",
      nl: "Vakantieverhuur",
      pap: "Hür pa vakashon",
      es: "Alquiler vacacional",
    },
    secondaryQuery: "purpose=rent",
  },
} as const;

function categoryActions(
  lang: Lang,
  island: IslandId,
  slug: keyof typeof ACTION_LABELS
) {
  const L = ACTION_LABELS[slug];
  const base = `/${lang}/islands/${island}/${slug}`;
  return [
    { label: L.primary[lang], href: base },
    { label: L.secondary[lang], href: `${base}?${L.secondaryQuery}` },
  ];
}

/* Helpers */
function getCopy(lang: Lang, island: IslandId): Copy {
  const byLang = COPY[lang] ?? COPY.en;
  return byLang[island] ?? COPY.en[island];
}

/* Metadata */
type PageParams = {
  params: Promise<{ lang: Lang; island: IslandId }>;
};

export async function generateMetadata(
  { params }: PageParams
): Promise<Metadata> {
  const { lang, island } = await params;

  if (!ISLANDS.includes(island)) {
    return {
      title: "Island not found | Guide Me ABC",
      description: "Please choose Aruba, Bonaire or Curaçao.",
      robots: { index: false, follow: false },
    };
  }

  const c = getCopy(lang, island);
  const image = ISLAND_BG[island];
  const title = `${c.name} – ${c.tagline} | Guide Me ABC`;

  const languages: Record<string, string> = {
    en: `/en/islands/${island}`,
    nl: `/nl/islands/${island}`,
    pap: `/pap/islands/${island}`,
    es: `/es/islands/${island}`,
  };

  return {
    title,
    description: c.description,
    alternates: { languages },
    openGraph: {
      title,
      description: c.description,
      url: `/${lang}/islands/${island}`,
      type: "website",
      images: [
        { url: image, width: 1200, height: 630, alt: `${c.name} hero` },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: c.description,
      images: [image],
    },
  };
}

/* Page */
export default async function IslandPage({ params }:
  PageParams) {
  const { lang, island } = await params;

  if (!ISLANDS.includes(island)) {
    notFound();
  }

  const c = getCopy(lang, island);
  const bg = ISLAND_BG[island];

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative h-[60vh] mt-16">
        <ResponsiveImage
          src={bg}
          alt={`${c.name} hero`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/40" />
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1
              className="text-5xl md:text-6xl font-extrabold mb-2 text-white"
              style={{
                textShadow:
                  "0 1px 0 rgba(0,0,0,.85), 0 -1px 0 rgba(0,0,0,.85), 1px 0 0 rgba(0,0,0,.85), -1px 0 0 rgba(0,0,0,.85), 0 16px 36px rgba(0,0,0,.35)",
              }}
            >
              {c.name}
            </h1>
            <p
              className="text-xl md:text-2xl text-white/95 mb-4"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,.55)" }}
            >
              {c.tagline}
            </p>
            <p
              className="max-w-3xl mx-auto text-white/90"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,.45)" }}
            >
              {c.description}
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* CATEGORIES */}
        <section>
          <h2 className="text-3xl font-bold mb-8">
            {c.exploreByCategory}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {c.categories.map((cat) => {
              const [primary, secondary] = categoryActions(
                lang,
                island,
                cat.slug
              );
              return (
                <div
                  key={cat.slug}
                  className="rounded-xl border p-4 text-center bg-card hover:border-primary/50 transition-shadow"
                  style={{
                    boxShadow: "0 4px 20px hsl(220 15% 20% / .08)",
                  }}
                >
                  <div className="font-semibold">{cat.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {cat.subtitle}
                  </div>

                  <div className="mt-3 flex flex-col items-center gap-2 text-sm">
                    <Link
                      href={primary.href}
                      className="text-primary font-medium hover:underline"
                    >
                      {primary.label} →
                    </Link>
                    <Link
                      href={secondary.href}
                      className="text-muted-foreground hover:underline"
                    >
                      {secondary.label}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* TOP THINGS */}
        <section className="max-w-4xl">
          <h2 className="text-3xl font-bold mb-4">{c.topTitle}</h2>
          <ol className="list-decimal ml-5 space-y-2 text-muted-foreground">
            {c.topThings.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}
