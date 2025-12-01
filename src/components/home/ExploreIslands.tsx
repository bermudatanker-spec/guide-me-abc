// src/components/home/ExploreIslands.tsx
"use client";

import Link from "next/link";
import type { Island } from "@/components/IslandCard";
import IslandCard from "@/components/IslandCard";
import type { Locale } from "@/i18n/config";

type Props = {
  lang: Locale;
};

const ISLANDS: Island[] = [
  {
    id: "aruba",
    name: "Aruba",
    tagline: "One Happy Island",
    description: "Stranden, nightlife en familievriendelijke hotspots.",
    image: "/images/aruba-island.jpg",
    highlights: [
      "Witte zandstranden",
      "High-rise hotels & nightlife",
      "Eagle Beach & Palm Beach",
      "Perfect voor families en koppels",
    ],
  },
  {
    id: "bonaire",
    name: "Bonaire",
    tagline: "Diver's Paradise",
    description:
      "Wereldberoemde duikspots, rust en ongerepte natuur boven & onder water.",
    image: "/images/bonaire-island.jpg",
    highlights: [
      "Walhalla voor duikers",
      "Rustig en kleinschalig",
      "Zoutpannen en flamingo's",
      "Caribbean vibes zonder massa's",
    ],
  },
  {
    id: "curacao",
    name: "Curaçao",
    tagline: "Colorful Culture",
    description:
      "Kleurrijke wijken, culinaire scene en verborgen baaien om te ontdekken.",
    image: "/images/curacao-island.jpg",
    highlights: [
      "Handelskade & Pietermaai",
      "Lokale keuken & street food",
      "Verborgen strandjes",
      "Mix van cultuur en natuur",
    ],
  },
];

export default function ExploreIslands({ lang }: Props) {
  const title =
    lang === "nl" ? "Verken de eilanden" : "Explore the islands";
  const cta =
    lang === "nl" ? "Bekijk alle eilanden →" : "View all islands →";

  return (
    <section className="space-y-4">
  {/* Titel + CTA bovenaan */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground sm:text-xl">
          {title}
           </h2>
       
       <Link
          href={`/${lang}/islands`}
          className="inline-flex items-center justify-center text-xs font-semibold text-[#00bfd3] hover:underline sm:text-sm"
        >
          {cta}
        </Link>
      </div>

      {/* Grid met 3 kolommen op desktop */}
       <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {ISLANDS.map((island) => (
        <IslandCard key={island.id} lang={lang} {...island} />
        ))}
      </div>
    </section>
  );
}