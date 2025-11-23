// app/[lang]/page.tsx
import type { Metadata } from "next";

import Hero from "@/components/home/Hero";
import QuickFilters from "@/components/home/QuickFilters";
import FeaturedExperiences from "@/components/home/FeaturedExperiences";
import ExploreIslands from "@/components/home/ExploreIslands";
import LocalTips from "@/components/home/LocalTips";

type PageProps = {
  params: { lang: string };
};

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: PageProps): Metadata {
  return {
    title: "Guide Me ABC – Discover Aruba, Bonaire & Curaçao",
    description:
      "Your gateway to the ABC Islands. Explore beaches, food, tours, stays and trusted local businesses.",
  };
}

export default function LangHomePage({ params }: PageProps) {
  const { lang } = params;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-[#2d303b]">
      {/* PREMIUM HERO */}
      <Hero lang={lang} />

      {/* CONTENT CONTAINER */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 space-y-16 pb-20">

        {/* QUICK DISCOVERY FILTERS */}
        <QuickFilters lang={lang} />

        {/* FEATURED EXPERIENCES */}
        <FeaturedExperiences lang={lang} />

        {/* EXPLORE THE ISLANDS */}
        <ExploreIslands lang={lang} />

        {/* LOCAL TIPS & GUIDES */}
        <LocalTips lang={lang} />

        {/* CTA FOR BUSINESSES */}
        <section className="rounded-3xl bg-gradient-to-r from-[#e0f8ff] via-[#dff9f6] to-[#ffeae2] px-6 py-10 border border-slate-200 shadow-sm">
          <div className="grid gap-6 md:grid-cols-[1.5fr,1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#00bfd3]">
                For Local Entrepreneurs
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                Laat toeristen jou vinden — niet andersom.
              </h2>
              <p className="mt-3 text-sm text-slate-700">
                Bouw jouw bedrijfsprofiel, toon foto’s, voeg voorzieningen toe
                en word zichtbaar voor duizenden toeristen op Aruba, Bonaire en
                Curaçao.
              </p>
              <ul className="mt-3 text-sm text-slate-700 space-y-1">
                <li>• Eerste 6 maanden gratis</li>
                <li>• WhatsApp & website links</li>
                <li>• Mini-website & reviews in Pro Plan</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={`/${lang}/business/auth`}
                className="inline-flex items-center justify-center rounded-full bg-[#00bfd3] px-5 py-3 text-sm font-semibold text-white shadow hover:opacity-90 transition"
              >
                Registreer je bedrijf
              </a>
              <a
                href={`/${lang}/for-business`}
                className="text-xs text-slate-600 hover:text-slate-800 text-center"
              >
                Meer info over pakketten →
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
