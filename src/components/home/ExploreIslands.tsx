// src/components/home/ExploreIslands.tsx
"use client";

import type { Island } from "@/components/IslandCard";
import IslandCard from "@/components/IslandCard";

type Props = {
  lang: string;
};

const islands: Island[] = [
  {
    id: "aruba",
    name: "Aruba",
    tagline: "One Happy Island",
    description: "Stranden, nightlife en familievriendelijke hotspots.",
    image: "/images/islands/aruba.jpg",
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
    image: "/images/islands/bonaire.jpg",
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
    image: "/images/islands/curacao.jpg",
    highlights: [
      "Handelskade & Pietermaai",
      "Lokale keuken & street food",
      "Verborgen strandjes",
      "Mix van cultuur en natuur",
    ],
  },
];

export default function ExploreIslands({ lang }: Props) {
  return (
    <section className="space-y-3">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#2d303b] sm:text-xl">
          Verken de eilanden
        </h2>
        <a
          href={`/${lang}/islands`}
          className="text-xs font-semibold text-[#00bfd3] hover:underline sm:text-sm"
        >
          Bekijk alle eilanden →
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {islands.map((island) => (
          <IslandCard key={island.id} lang={lang} {...island} />
        ))}
      </div>
    </section>
  );
}
