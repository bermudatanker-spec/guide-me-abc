// src/components/home/IslandsOverview.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/i18n/config";

type IslandId = "aruba" | "bonaire" | "curacao";

type IslandCard = {
  id: IslandId;
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  href: string;
  image: string;
  ctaLabel: string;
};

type Props = {
  lang: Locale;
};

const ISLANDS_BY_LOCALE: Record<Locale, IslandCard[]> = {
  en: [
    {
      id: "aruba",
      name: "Aruba",
      tagline: "One Happy Island",
      description:
        "White-sand beaches, beach bars and family-friendly hotspots.",
      highlights: [
        "Palm and white sand beaches",
        "Lively nightlife & beach clubs",
        "Eagle Beach & Palm Beach",
        "Perfect for couples and families",
      ],
      href: "/en/islands/aruba",
      image: "/images/aruba-island.jpg",
      ctaLabel: "Explore Aruba",
    },
    {
      id: "bonaire",
      name: "Bonaire",
      tagline: "Diver’s Paradise",
      description:
        "World-class shore diving, relaxed vibes and nature reserves.",
      highlights: [
        "World-famous dive & snorkel sites",
        "Relaxed and small-scale atmosphere",
        "Salt pans & flamingos",
        "Caribbean vibes without the crowds",
      ],
      href: "/en/islands/bonaire",
      image: "/images/bonaire-island.jpg",
      ctaLabel: "Explore Bonaire",
    },
    {
      id: "curacao",
      name: "Curaçao",
      tagline: "Colorful & Authentic",
      description: "Street art, historic Willemstad and hidden coves.",
      highlights: [
        "Handelskade & Pietermaai",
        "Local cuisine & street food",
        "Hidden beaches and coves",
        "Mix of culture and nature",
      ],
      href: "/en/islands/curacao",
      image: "/images/curacao-island.jpg",
      ctaLabel: "Explore Curaçao",
    },
  ],
  nl: [
    {
      id: "aruba",
      name: "Aruba",
      tagline: "One Happy Island",
      description:
        "Witte zandstranden, beach bars en familievriendelijke hotspots.",
      highlights: [
        "Playa blanca met palmbomen",
        "High-rise hotels & nightlife",
        "Eagle Beach & Palm Beach",
        "Perfect voor families en koppels",
      ],
      href: "/nl/islands/aruba",
      image: "/images/aruba-island.jpg",
      ctaLabel: "Ontdek Aruba",
    },
    {
      id: "bonaire",
      name: "Bonaire",
      tagline: "Diver’s Paradise",
      description:
        "Wereldberoemd shore-diving, relaxte sfeer en mooie natuur.",
      highlights: [
        "Walhalla voor duikers & snorkelaars",
        "Rustig en kleinschalig",
        "Zoutpannen en flamingo’s",
        "Caribische vibes zonder massa’s",
      ],
      href: "/nl/islands/bonaire",
      image: "/images/bonaire-island.jpg",
      ctaLabel: "Ontdek Bonaire",
    },
    {
      id: "curacao",
      name: "Curaçao",
      tagline: "Kleurrijk & authentiek",
      description: "Street art, historisch Willemstad en verborgen baaitjes.",
      highlights: [
        "Handelskade & Pietermaai",
        "Lokale keuken & streetfood",
        "Verborgen strandjes",
        "Mix van cultuur en natuur",
      ],
      href: "/nl/islands/curacao",
      image: "/images/curacao-island.jpg",
      ctaLabel: "Ontdek Curaçao",
    },
  ],
  pap: [
    {
      id: "aruba",
      name: "Aruba",
      tagline: "One Happy Island",
      description: "Playa blanku, bar di playa i ambiente felis.",
      highlights: [
        "Playa ku palma i zjala blanku",
        "Bida nochturno yen ambiente",
        "Eagle Beach i Palm Beach",
        "Perfekto pa pareha i famia",
      ],
      href: "/pap/islands/aruba",
      image: "/images/aruba-island.jpg",
      ctaLabel: "Deskubrí Aruba",
    },
    {
      id: "bonaire",
      name: "Boneiru",
      tagline: "Diver’s Paradise",
      description:
        "Luga perfektu pa buseo i snorkel, ku hopi trankilidad.",
      highlights: [
        "Miho buseo for di kantu",
        "Saliña i flamingo",
        "Ambiente trankil i chikí",
        "Karibe sin hopi turista",
      ],
      href: "/pap/islands/bonaire",
      image: "/images/bonaire-island.jpg",
      ctaLabel: "Deskubrí Boneiru",
    },
    {
      id: "curacao",
      name: "Kòrsou",
      tagline: "Kolorido i autentiko",
      description:
        "Arte di kaya, Willemstad historiko i baainan skondí.",
      highlights: [
        "Handelskade i Pietermaai",
        "Kome lokal i street food",
        "Playa skondí chikí",
        "Mesklá di kultura i natura",
      ],
      href: "/pap/islands/curacao",
      image: "/images/curacao-island.jpg",
      ctaLabel: "Deskubrí Kòrsou",
    },
  ],
  es: [
    {
      id: "aruba",
      name: "Aruba",
      tagline: "One Happy Island",
      description:
        "Playas de arena blanca, chiringuitos y ambiente familiar.",
      highlights: [
        "Playas de arena blanca",
        "Bares de playa y clubs",
        "Eagle Beach y Palm Beach",
        "Ideal para parejas y familias",
      ],
      href: "/es/islands/aruba",
      image: "/images/aruba-island.jpg",
      ctaLabel: "Descubre Aruba",
    },
    {
      id: "bonaire",
      name: "Bonaire",
      tagline: "Paraíso del buceo",
      description:
        "Buceo de costa de primera y un ambiente muy tranquilo.",
      highlights: [
        "Puntos de buceo y esnórquel de clase mundial",
        "Ambiente relajado y pequeño",
        "Salinas y flamencos",
        "Caribe sin multitudes",
      ],
      href: "/es/islands/bonaire",
      image: "/images/bonaire-island.jpg",
      ctaLabel: "Descubre Bonaire",
    },
    {
      id: "curacao",
      name: "Curaçao",
      tagline: "Colorido y auténtico",
      description:
        "Street art, Willemstad histórico y calas escondidas.",
      highlights: [
        "Handelskade y Pietermaai",
        "Cocina local y street food",
        "Playas y calas escondidas",
        "Mezcla de cultura y naturaleza",
      ],
      href: "/es/islands/curacao",
      image: "/images/curacao-island.jpg",
      ctaLabel: "Descubre Curaçao",
    },
  ],
};

const SECTION_TITLE: Record<Locale, string> = {
  en: "Explore the ABC Islands",
  nl: "Ontdek de ABC-eilanden",
  pap: "Deskubrí e isla ABC",
  es: "Descubre las islas ABC",
};

const SECTION_SUBTITLE: Record<Locale, string> = {
  en: "Choose an island to see guides, tips and local businesses.",
  nl: "Kies een eiland voor gidsen, tips en lokale bedrijven.",
  pap: "Skohé un isla pa wak guia, tipnan i negoshonan lokal.",
  es: "Elige una isla para ver guías, consejos y negocios locales.",
};

export default function IslandsOverview({ lang }: Props) {
  const islands = ISLANDS_BY_LOCALE[lang] ?? ISLANDS_BY_LOCALE.en;
  const title = SECTION_TITLE[lang] ?? SECTION_TITLE.en;
  const subtitle = SECTION_SUBTITLE[lang] ?? SECTION_SUBTITLE.en;

  return (
    <section className="py-12">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient-abc text-shadow-hero">
            {title}
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {islands.map((island) => (
          <Link key={island.id} href={island.href} className="group">
            <article
              className="
                gm-glass relative h-full overflow-hidden rounded-3xl
                shadow-card transition-transform duration-200
                group-hover:-translate-y-1 group-hover:shadow-glow
              "
            >
              {/* Foto */}
              <div className="relative h-40 w-full overflow-hidden rounded-t-3xl">
                <Image
                  src={island.image}
                  alt={island.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw"
                />
                <div className="pointer-events-none absolute inset-0 hero-haze" />
              </div>

              {/* Content */}
              <div className="gm-glass-inner px-5 pb-5 pt-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-lg font-semibold text-foreground">
                    {island.name}
                  </h3>
                  <span
                    className="
                      gm-glass-pill gm-glass-pill-strong
                      px-3 py-1 text-xs font-semibold uppercase tracking-wide
                      text-slate-700
                    "
                  >
                    {island.tagline}
                  </span>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  {island.description}
                </p>

                {island.highlights.length > 0 && (
                  <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                    {island.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}

                <div className="mt-4">
                  <button
                    type="button"
                    className="
                      button-gradient btn-glow
                      inline-flex w-full items-center justify-center
                      gap-1 rounded-full px-5 py-2
                      text-sm font-semibold
                      transition-transform duration-150
                      group-hover:scale-[1.02]
                    "
                  >
                    {island.ctaLabel}
                    <span className="ml-1 inline-block translate-x-0 transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </button>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}