// app/[lang]/page.tsx
import type { Metadata } from "next";

import { isLocale, type Locale } from "@/i18n/config";

import Hero from "@/components/home/Hero";
import QuickFilters from "@/components/home/QuickFilters";
import FeaturedExperiences from "@/components/home/FeaturedExperiences";
import IslandsOverview from "@/components/home/IslandsOverview";
import LocalTips from "@/components/home/LocalTips";
import SearchBar from "@/components/home/SearchBar";

type PageProps = {
  // Next.js 16: params is Promise + runtime is altijd string
  params: Promise<{ lang: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "en";

  const title =
    lang === "nl"
      ? "Guide Me ABC – Ontdek Aruba, Bonaire & Curaçao"
      : "Guide Me ABC – Discover the ABC Islands";

  const description =
    lang === "nl"
      ? "Vind lokale bedrijven, activiteiten en hidden gems op Aruba, Bonaire en Curaçao. Voor toeristen én lokale ondernemers."
      : "Find the best beaches, restaurants, tours and trusted local businesses on Aruba, Bonaire and Curaçao.";

  return { title, description };
}

export default async function HomePage({ params }: PageProps) {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "en";

  return (
    <main className="min-h-screen bg-[#fdf7f1] text-slate-900">
      <section className="pb-32">
        <Hero lang={lang} />

        <div className="mt-[-80px] flex justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-[880px]">
            <SearchBar lang={lang} />
          </div>
        </div>
      </section>

      <div className="px-4 sm:px-6 lg:px-10 max-w-6xl mx-auto pb-16 space-y-10">
        <QuickFilters lang={lang} />
        <FeaturedExperiences lang={lang} />
        <IslandsOverview lang={lang} />
        <LocalTips lang={lang} />
      </div>
    </main>
  );
}