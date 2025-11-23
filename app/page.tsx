"use client";

import Hero from "@/components/home/Hero";
import SearchBar from "@/components/SearchBar";
import QuickLinks from "@/components/QuickLinks";
import IslandCard, { type Island } from "@/components/IslandCard";
import FeaturedHighlights from "@/components/FeaturedHighlights";
import BlogPreview from "@/components/BlogPreview";
import { useLanguage } from "@/hooks/useLanguage";

// Afbeeldingen als STRING-paden naar /public/images (geen imports)
const ISLANDS: Readonly<Island[]> = [
  {
    id: "aruba",
    name: "Aruba",
    tagline: "One Happy Island",
    description:
      "Known for its pristine white-sand beaches and year-round sunshine, Aruba offers the perfect blend of relaxation and adventure in the southern Caribbean.",
    image: "/images/aruba-island.jpg",
    highlights: [
      "Eagle Beach - consistently ranked among the world's best beaches",
      "Arikok National Park with unique desert landscapes",
      "Vibrant nightlife and world-class resorts",
      "Perfect weather with minimal rainfall",
    ],
  },
  {
    id: "bonaire",
    name: "Bonaire",
    tagline: "Diver's Paradise",
    description:
      "A UNESCO World Heritage site, Bonaire is renowned for pristine coral reefs and world-class shore diving.",
    image: "/images/bonaire-island.jpg",
    highlights: [
      "80+ shore dive sites with crystal-clear visibility",
      "Bonaire National Marine Park",
      "Windsurfing & kiteboarding",
      "Tranquil, nature-focused vibe",
    ],
  },
  {
    id: "curacao",
    name: "Curaçao",
    tagline: "Colorful Caribbean",
    description:
      "Vibrant Dutch colonial architecture, diverse culture, and 35+ beaches from secluded coves to lively shores.",
    image: "/images/curacao-island.jpg",
    highlights: [
      "Willemstad UNESCO historic center",
      "35+ diverse beaches",
      "Caribbean–European cultural fusion",
      "Rich art scene & cuisine",
    ],
  },
];

export default function IndexPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <Hero />

      {/* Content onder de Hero blijft gewoon bestaan */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        {/* Search */}
        <section className="mt-8">
          <SearchBar />
        </section>

        {/* Quick Links */}
        <section className="py-12" aria-labelledby="quick-links">
          <h2 id="quick-links" className="sr-only">
            Quick links
          </h2>
          <QuickLinks />
        </section>

        {/* Featured */}
        <section className="py-8">
          <FeaturedHighlights />
        </section>

        {/* Islands */}
        <section id="islands" className="py-12" aria-labelledby="islands-heading">
          <h2 id="islands-heading" className="text-3xl font-bold mb-8 text-foreground">
            {t.exploreIslands}
          </h2>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {ISLANDS.map((island) => (
              <IslandCard key={island.id} {...island} />
            ))}
          </div>
        </section>

        {/* Blog */}
        <section className="py-12">
          <BlogPreview />
        </section>
      </main>
    </div>
  );
}