// app/[lang]/islands/page.tsx
import type { Metadata } from "next";
import ResponsiveImage from "@/components/ResponsiveImage";
import Link from "next/link";
import { isLocale, type Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";

type PageParams = { lang: Locale };

// Maak deze route gewoon dynamic om gezeur met export paths te voorkomen
export const dynamic = "force-dynamic";

/* SEO */
export function generateMetadata(
  { params }: { params: PageParams }
): Metadata {
  const raw = params.lang;
  const lang = isLocale(raw) ? raw : "en";

  const title = "ABC Islands | Guide Me ABC";
  const description =
    "Discover Aruba, Bonaire, and Curaçao — pristine beaches, vibrant culture, and local highlights across the Caribbean.";

  const languages: Record<string, string> = {
    en: "/en/islands",
    nl: "/nl/islands",
    pap: "/pap/islands",
    es: "/es/islands",
  };

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/islands`,
      languages,
    },
    openGraph: {
      title,
      description,
      url: `/${lang}/islands`,
    },
  };
}

/* Page */
export default function IslandsIndex(
  { params }: { params: PageParams }
) {
  const raw = params.lang;
  const lang = isLocale(raw) ? raw : "en";

  const islands = [
    {
      id: "aruba",
      name: "Aruba",
      tagline: "One Happy Island",
      desc:
        "Known for its pristine white-sand beaches and year-round sunshine, Aruba offers the perfect blend of relaxation and adventure in the southern Caribbean.",
      highlights: [
        "Eagle Beach – consistently ranked among the world’s best beaches",
        "Arikok National Park with unique desert landscapes",
        "Vibrant nightlife and world-class resorts",
        "Perfect weather with minimal rainfall",
      ],
      img: "/images/aruba-island.jpg",
    },
    {
      id: "bonaire",
      name: "Bonaire",
      tagline: "Diver’s Paradise",
      desc:
        "A UNESCO World Heritage site, Bonaire is renowned for having some of the most pristine coral reefs and best shore diving in the world.",
      highlights: [
        "1000 Steps dive site with crystal-clear visibility",
        "Bonaire National Marine Park protecting stunning reefs",
        "World-class windsurfing and kiteboarding",
        "Tranquil atmosphere perfect for nature lovers",
      ],
      img: "/images/bonaire-island.jpg",
    },
    {
      id: "curacao",
      name: "Curaçao",
      tagline: "Colorful Caribbean",
      desc:
        "Experience vibrant Dutch colonial architecture, diverse culture, and over 35 beaches ranging from secluded coves to bustling shores.",
      highlights: [
        "Willemstad’s UNESCO World Heritage historic center",
        "35+ stunning beaches with diverse character",
        "Rich cultural fusion of Caribbean and European heritage",
        "Vibrant art scene and culinary experiences",
      ],
      img: "/images/curacao-island.jpg",
    },
  ] as const;

  return (
    <div className="min-h-screen pt-24 container mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-12 text-center">
        Explore the ABC Islands
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {islands.map((i) => (
          <div
            key={i.id}
            className="rounded-xl overflow-hidden border bg-card shadow-sm hover:shadow-lg transition-all"
          >
            <div className="relative aspect-[4/3]">
              <ResponsiveImage
                src={i.img}
                alt={i.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-bold mb-1">{i.name}</h2>
              <p className="text-primary font-medium mb-3">
                {i.tagline}
              </p>
              <p className="text-muted-foreground text-sm mb-4">
                {i.desc}
              </p>

              <h3 className="text-sm font-semibold mb-2 text-foreground">
                Highlights:
              </h3>
              <ul className="text-sm text-muted-foreground mb-6 list-disc pl-4 space-y-1">
                {i.highlights.map((h, idx) => (
                  <li key={idx}>{h}</li>
                ))}
              </ul>

              <Button
                asChild
                className="w-full font-semibold text-white"
                style={{
                  background:
                    "linear-gradient(90deg, #00BFD3 0%, #00E0A1 100%)",
                  boxShadow:
                    "0 4px 12px rgba(0,191,211,0.45), 0 0 18px rgba(0,191,211,0.35)",
                }}
              >
                <Link href={`/${lang}/islands/${i.id}`}>
                  Explore {i.name}
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
