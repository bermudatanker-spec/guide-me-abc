// app/[lang]/page.tsx
import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";

import Hero from "@/components/home/Hero";
import QuickFilters from "@/components/home/QuickFilters";
import FeaturedExperiences from "@/components/home/FeaturedExperiences";
import ExploreIslands from "@/components/home/ExploreIslands";
import LocalTips from "@/components/home/LocalTips";

type PageProps = {
  params: { lang: Locale };
};

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: PageProps): Metadata {
  const { lang } = params;

  const title =
    lang === "nl"
      ? "Guide Me ABC – Ontdek Aruba, Bonaire & Curaçao"
      : "Guide Me ABC – Discover the ABC Islands";

  const description =
    lang === "nl"
      ? "Vind lokale bedrijven, activiteiten en hidden gems op Aruba, Bonaire en Curaçao. Voor toeristen én lokale ondernemers."
      : "Find the best beaches, restaurants, tours and trusted local businesses on Aruba, Bonaire and Curaçao.";

  return {
    title,
    description,
  };
}

export default function HomePage({ params }: PageProps) {
  const { lang } = params;

  return (
    <main className="min-h-screen bg-slate-50 text-[#2d303b]">
      {/* Hero met jouw gradient knoppen */}
      <Hero lang={lang} />

      <div className="px-4 sm:px-6 lg:px-10 max-w-6xl mx-auto pb-16 space-y-10">
        <QuickFilters lang={lang} />
        <FeaturedExperiences />
        <ExploreIslands lang={lang} />
        <LocalTips lang={lang} />
      </div>
    </main>
  );
}
