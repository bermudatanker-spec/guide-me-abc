// src/components/home/Hero.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import ResponsiveImage from "@/components/ResponsiveImage";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { getLangFromPath } from "@/lib/locale-path";

type HeroProps = {
  lang?: string; // expliciet lang doorgeven is nu mogelijk, maar niet verplicht
};

export default function Hero({ lang }: HeroProps) {
  const { t } = useLanguage();
  const pathname = usePathname() ?? "/";

  // 1) als lang prop is meegegeven (via app/[lang]/page.tsx) → gebruik die
  // 2) anders: haal 'm uit de URL via getLangFromPath
  const activeLang = lang ?? getLangFromPath(pathname);

  const title =
    (t as any)?.exploreIslands ?? "Discover the ABC Islands";
  const subtitle =
    (t as any)?.faqSubtitle ??
    "Find the best beaches, restaurants, tours and trusted local businesses.";

  const ctaExplore =
    (t as any)?.exploreIslandsCta ?? "Explore the Islands";
  const ctaBusiness =
    (t as any)?.forBusiness ?? "For Business";

  return (
    <section className="relative isolate w-full">
      {/* Achtergrondafbeelding + overlays */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <ResponsiveImage
          src="/images/hero-abc-islands.jpg"
          alt="ABC Islands lagoon"
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,191,211,0.35) 0%, rgba(0,191,211,0.16) 24%, rgba(0,191,211,0.08) 46%, rgba(0,191,211,0) 68%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/55" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-[72vh] flex items-center">
          <div className="max-w-3xl text-white">
            {/* Glass badge */}
            <span className="mb-4 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/20 backdrop-blur">
              ABC Islands • Aruba • Bonaire • Curaçao
            </span>

            {/* Titel */}
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              {title}
            </h1>

            {/* Subtitel */}
            <p className="mt-4 text-base md:text-lg text-white/90">
              {subtitle}
            </p>

            {/* CTA knoppen */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="text-white font-semibold transition-transform duration-300 ease-out hover:scale-105"
                style={{
                  background:
                    "linear-gradient(90deg, #00BFD3 0%, #009EC2 100%)",
                  boxShadow: "0 6px 16px rgba(0,191,211,0.45)",
                }}
              >
                <Link href={`/${activeLang}/islands`}>{ctaExplore}</Link>
              </Button>

              <Button
                asChild
                size="lg"
                className="text-white font-semibold transition-transform duration-300 ease-out hover:scale-105"
                style={{
                  background:
                    "linear-gradient(90deg, #FF7A4F 0%, #FFA07A 100%)",
                  boxShadow: "0 6px 16px rgba(255,122,79,0.45)",
                }}
              >
                <Link href={`/${activeLang}/business/auth`}>
                  {ctaBusiness}
                </Link>
              </Button>
            </div>

            {/* Bulletpoints onder hero */}
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
              <li>✔ Trusted local listings</li>
              <li>✔ Tourist-friendly</li>
              <li>✔ Multi-language</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
