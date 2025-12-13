// src/components/home/FeaturedExperiences.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";

type Experience = {
  id: string;
  title: string;
  subtitle: string;
  bullets: [string, string, string];
  href: string;
  image: string;
  islandLabel: "Aruba" | "Bonaire" | "Curaçao";
};

type Props = {
  lang: Locale;
};

const COPY: Record<
  Locale,
  {
    heading: string;
    sub: string;
    cta: string;
  }
> = {
  nl: {
    heading: "Unieke ervaringen op de ABC-eilanden",
    sub: "Concrete momenten die je reis speciaal maken — zonder eiland-tekst te herhalen.",
    cta: "Bekijk deze ervaring",
  },
  en: {
    heading: "Featured experiences on the ABC Islands",
    sub: "Concrete moments that make your trip special — without repeating island identity.",
    cta: "View this experience",
  },
  pap: {
    heading: "Eksperiensia spesial na ABC",
    sub: "Momento konkreto pa hasi bo biahe mas spesial — sin ripití identidat di e isla.",
    cta: "Wak e eksperiensia",
  },
  es: {
    heading: "Experiencias destacadas en las islas ABC",
    sub: "Momentos concretos para hacer tu viaje más especial — sin repetir la identidad de la isla.",
    cta: "Ver esta experiencia",
  },
};

const EXPERIENCES_BY_LANG: Record<Locale, Experience[]> = {
  nl: [
    {
      id: "sunset-catamaran",
      islandLabel: "Aruba",
      title: "Sunset catamaran tour",
      subtitle: "Gouden zonsondergang op zee, met een cocktail in je hand.",
      bullets: [
        "All-inclusive drankjes & lichte hapjes",
        "Rustige cruise langs Palm Beach",
        "Ideaal voor koppels & vriendengroepen",
      ],
      href: "/nl/islands/aruba",
      image: "/images/sunset-beach-aruba.jpg",
    },
    {
      id: "shore-diving",
      islandLabel: "Bonaire",
      title: "Wereldklasse shore diving",
      subtitle: "Stap het water in en zweef direct boven het rif.",
      bullets: [
        "Duiken zonder boot, direct vanaf de kust",
        "Ongelooflijke zichtbaarheid en rust",
        "Geschikt voor beginners én ervaren duikers",
      ],
      href: "/nl/islands/bonaire",
      image: "/images/scuba-diving-bonaire.jpg",
    },
    {
      id: "willemstad-evening-walk",
      islandLabel: "Curaçao",
      title: "Avondwandeling door Willemstad",
      subtitle: "Wanneer de stad afkoelt, komt Curaçao tot leven.",
      bullets: [
        "Verlichte Handelskade & Pontjesbrug",
        "Streetfood, muziek en lokale bars",
        "Perfect te combineren met diner",
      ],
      href: "/nl/islands/curacao",
      image: "/images/curacao-city.jpg",
    },
  ],
  en: [
    {
      id: "sunset-catamaran",
      islandLabel: "Aruba",
      title: "Sunset catamaran tour",
      subtitle: "Golden hour at sea, cocktail in hand.",
      bullets: [
        "All-inclusive drinks & light bites",
        "Relaxed cruise past Palm Beach",
        "Perfect for couples & friends",
      ],
      href: "/en/islands/aruba",
      image: "/images/sunset-beach-aruba.jpg",
    },
    {
      id: "shore-diving",
      islandLabel: "Bonaire",
      title: "World-class shore diving",
      subtitle: "Step in from the coast and glide above the reef.",
      bullets: [
        "No boat needed — straight from shore",
        "Incredible visibility and calm waters",
        "Great for beginners and advanced divers",
      ],
      href: "/en/islands/bonaire",
      image: "/images/scuba-diving-bonaire.jpg",
    },
    {
      id: "willemstad-evening-walk",
      islandLabel: "Curaçao",
      title: "Willemstad evening walk",
      subtitle: "As the city cools down, Curaçao comes alive.",
      bullets: [
        "Lit-up Handelskade & the floating bridge",
        "Street food, music and local bars",
        "Easy to pair with dinner",
      ],
      href: "/en/islands/curacao",
      image: "/images/curacao-city.jpg",
    },
  ],
  // Voor nu hergebruik NL zodat je nooit “engels per ongeluk” krijgt
  pap: [],
  es: [],
};

export default function FeaturedExperiences({ lang }: Props) {
  const copy = COPY[lang] ?? COPY.nl;

  const list =
    (EXPERIENCES_BY_LANG[lang] && EXPERIENCES_BY_LANG[lang].length > 0
      ? EXPERIENCES_BY_LANG[lang]
      : EXPERIENCES_BY_LANG.nl) ?? EXPERIENCES_BY_LANG.nl;

  return (
    <section className="py-12 lg:py-16">
      <div className="mb-6 flex flex-col gap-2 lg:mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {copy.heading}
        </h2>
        <p className="max-w-2xl text-sm text-muted-foreground">{copy.sub}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {list.map((item) => (
          <article key={item.id} className="gm-card group">
            {/* Image */}
            <div className="relative h-52 w-full overflow-hidden rounded-t-[32px]">
              <Image
                src={item.image}
                alt={item.title}
                fill
                priority={false}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"
              />
              <div className="pointer-events-none absolute inset-0 hero-haze" />

              {/* kleine eiland-chip (alleen label, geen slogan) */}
              <div className="absolute left-4 top-4 gm-glass-pill px-3 py-1 text-xs font-extrabold tracking-wide text-slate-700">
                {item.islandLabel.toUpperCase()}
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 pt-5">
              <h3 className="text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.subtitle}
              </p>

              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {item.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="mt-[7px] h-[4px] w-[4px] rounded-full bg-[color:var(--primary-hex)]/80" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {/* CTA als link (geen extra “grote knop” duplicatie) */}
              <div className="mt-5">
                <Link href={item.href} className="gm-link">
                  {copy.cta} <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}