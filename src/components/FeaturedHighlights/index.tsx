// src/components/home/FeaturedHighlights.tsx
"use client";

import type { Locale } from "@/i18n/config";

type Highlight = {
  title: string;
  excerpt: string;
};

type Props = {
  lang: Locale;
  items?: Highlight[];
};

const CONTENT: Record<Locale, Highlight[]> = {
  en: [
    {
      title: "Top snorkeling spots",
      excerpt: "Crystal-clear waters and vibrant reefs.",
    },
    {
      title: "Local food to try",
      excerpt: "Pastechi, stoba and fresh seafood.",
    },
    {
      title: "Hidden coves in Curaçao",
      excerpt: "Secluded beaches off the beaten path.",
    },
  ],
  nl: [
    {
      title: "Beste snorkelplekken",
      excerpt: "Kristalhelder water en kleurrijke riffen.",
    },
    {
      title: "Lokaal eten om te proberen",
      excerpt: "Pastechi, stoba en verse zeevruchten.",
    },
    {
      title: "Verborgen baaien op Curaçao",
      excerpt: "Rustige strandjes buiten de gebaande paden.",
    },
  ],
  pap: [
    {
      title: "Luga pa snorkel",
      excerpt: "Awa klaro i rif koredó.",
    },
    {
      title: "Kome lokal pa purba",
      excerpt: "Pastechi, stoba i piska fresco.",
    },
    {
      title: "Baainan scondí na Kòrsou",
      excerpt: "Playa chikí i trankil i for di bista turístiko.",
    },
  ],
  es: [
    {
      title: "Mejores lugares para esnórquel",
      excerpt: "Aguas cristalinas y arrecifes vibrantes.",
    },
    {
      title: "Comida local para probar",
      excerpt: "Pastechi, stoba y mariscos frescos.",
    },
    {
      title: "Calas escondidas en Curaçao",
      excerpt: "Playas tranquilas fuera de las rutas turísticas.",
    },
  ],
};

const TITLES: Record<Locale, string> = {
  en: "Featured Highlights",
  nl: "Uitgelichte tips",
  pap: "Tipnan di dia",
  es: "Destacados",
};

export default function FeaturedHighlights({ lang, items }: Props) {
  const list = items ?? CONTENT[lang];
  const title = TITLES[lang] ?? TITLES.en;

  return (
    <section className="py-12">
      <h2 className="mb-6 text-2xl font-bold text-foreground">{title}</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((h, i) => (
          <article
            key={i}
            className="rounded-xl border border-border bg-card p-5 shadow-sm transition
                       hover:shadow-md hover:-translate-y-0.5"
          >
            <h3 className="font-semibold text-foreground">{h.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{h.excerpt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}