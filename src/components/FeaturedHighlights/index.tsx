// src/components/home/FeaturedHighlights.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";

type Highlight = {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  island: "aruba" | "bonaire" | "curacao";
  badge: string;
  href: string;
};

type Props = {
  lang: Locale;
  items?: Highlight[];
};

const BASE_HIGHLIGHTS: Highlight[] = [
  {
    id: "snorkel",
    title: "Top snorkeling spots",
    excerpt: "Crystal-clear waters and vibrant reefs.",
    image: "/images/scuba-diving-curacao-city.jpg",
    island: "curacao",
    badge: "Snorkeling",
    href: "/curacao",
  },
  {
    id: "food",
    title: "Local food to try",
    excerpt: "Pastechi, stoba and fresh seafood.",
    image: "/images/palmbeach-seafood-grill-aruba.jpg",
    island: "aruba",
    badge: "Food",
    href: "/aruba",
  },
  {
    id: "coves",
    title: "Hidden coves in Curaçao",
    excerpt: "Secluded beaches off the beaten path.",
    image: "/images/sunset-beach-bonaire.jpg",
    island: "bonaire",
    badge: "Hidden gem",
    href: "/bonaire",
  },
];

const TITLES: Record<Locale, string> = {
  en: "Featured highlights",
  nl: "Uitgelichte tips",
  pap: "Tipnan di dia",
  es: "Destacados",
};

const TRANSLATED: Record<Locale, Partial<Record<Highlight["id"], Pick<Highlight, "title" | "excerpt">>>> =
  {
    en: {
      snorkel: {
        title: "Top snorkeling spots",
        excerpt: "Crystal-clear waters and vibrant reefs.",
      },
      food: {
        title: "Local food to try",
        excerpt: "Pastechi, stoba and fresh seafood.",
      },
      coves: {
        title: "Hidden coves in Curaçao",
        excerpt: "Secluded beaches off the beaten path.",
      },
    },
    nl: {
      snorkel: {
        title: "Beste snorkelplekken",
        excerpt: "Kristalhelder water en kleurrijke riffen.",
      },
      food: {
        title: "Lokaal eten om te proberen",
        excerpt: "Pastechi, stoba en verse zeevruchten.",
      },
      coves: {
        title: "Verborgen baaien op Curaçao",
        excerpt: "Rustige strandjes buiten de gebaande paden.",
      },
    },
    pap: {
      snorkel: {
        title: "Mehor luga pa snorkel",
        excerpt: "Awa klaro i rifnan koredó.",
      },
      food: {
        title: "Kome lokal pa purba",
        excerpt: "Pastechi, stoba i piska fresco.",
      },
      coves: {
        title: "Baainan scondí na Kòrsou",
        excerpt: "Playa trankil for di ruta turístiko.",
      },
    },
    es: {
      snorkel: {
        title: "Mejores lugares para esnórquel",
        excerpt: "Aguas cristalinas y arrecifes vibrantes.",
      },
      food: {
        title: "Comida local para probar",
        excerpt: "Pastechi, stoba y mariscos frescos.",
      },
      coves: {
        title: "Calas escondidas en Curaçao",
        excerpt: "Playas tranquilas fuera de las rutas turísticas.",
      },
    },
  };

export default function FeaturedHighlights({ lang, items }: Props) {
  const title = TITLES[lang] ?? TITLES.en;

  // basis + vertaling toepassen
  const list: Highlight[] =
    items ??
    BASE_HIGHLIGHTS.map((h) => {
      const t = TRANSLATED[lang]?.[h.id];
      return t ? { ...h, ...t } : h;
    });

  return (
    <section className="py-12">
      <h2 className="mb-6 text-2xl font-bold text-foreground">{title}</h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((h) => (
          <Link
            key={h.id}
            href={h.href}
            className="group block rounded-2xl border border-border/70 bg-card/95 shadow-card overflow-hidden transition hover:-translate-y-1 hover:shadow-glow"
          >
            <div className="relative h-44 w-full overflow-hidden">
              <Image
                src={h.image}
                alt={h.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                // <-- dit voorkomt de gele 'sizes' warnings
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                priority={false}
              />
            </div>

            <div className="flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 font-semibold uppercase tracking-wide text-muted-foreground">
                  {h.badge}
                </span>
                <span className="text-[11px] font-medium uppercase tracking-wide text-primary">
                  {h.island}
                </span>
              </div>

              <h3 className="text-base font-semibold text-foreground">
                {h.title}
              </h3>
              <p className="text-sm text-muted-foreground">{h.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}