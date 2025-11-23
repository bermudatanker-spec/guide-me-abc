// app/[lang]/page.tsx
import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";

import { langHref } from "@/lib/lang-href";
import Hero from "@/components/Hero";
// Als je QuickFilters / FeaturedExperiences / LocalTips ook wilt tonen,
// kun je ze hier importeren en onder Hero gebruiken.

// type Locale = string;  // gebruik dit als je geen echt Locale-type meer hebt

type PageProps = {
  params: { lang: string }; // of: { lang: Locale }
};

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: PageProps): Metadata {
  const { lang } = params;

  return {
    title: "Guide Me ABC – Ontdek Aruba, Bonaire & Curaçao",
    description:
      "Vind lokale bedrijven, activiteiten en hidden gems op Aruba, Bonaire en Curaçao. Voor toeristen én lokale ondernemers.",
    alternates: {
      canonical: `/${lang}`,
    },
  };
}

const islands = [
  {
    id: "aruba",
    name: "Aruba",
    tagline: "One Happy Island",
    blurb: "Stranden, nightlife en familievriendelijke hotspots.",
  },
  {
    id: "bonaire",
    name: "Bonaire",
    tagline: "Divers Paradise",
    blurb: "Wereldberoemde duikspots en rustieke charme.",
  },
  {
    id: "curacao",
    name: "Curaçao",
    tagline: "Colorful Culture",
    blurb: "Kleurrijke wijken, culinaire scene en verborgen baaien.",
  },
];

export default function LangHomePage({ params }: PageProps): ReactElement {
  const { lang } = params;

  return (
    <main className="bg-slate-50 text-slate-900">
      {/* Grote hero met foto / gradient / CTA’s (i18n via useLanguage) */}
      <Hero lang={lang} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Hero-copy + highlight card (voor toeristen) */}
        <section className="grid gap-10 py-10 lg:grid-cols-[1.4fr,1fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-800">
              Nieuwe generatie eilandgids
            </p>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Ontdek de beste lokale adressen op{" "}
              <span className="text-teal-600">
                Aruba, Bonaire &amp; Curaçao
              </span>
              .
            </h1>
            <p className="max-w-xl text-base text-slate-700 sm:text-lg">
              Eén platform voor alles: restaurants, autoverhuur, tours, duikshops,
              hidden gems en meer. Gekeurd, beoordeeld en gemaakt voor echte
              eilandliefhebbers.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={langHref(lang, "/islands")}
                className="inline-flex items-center rounded-full bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-600"
              >
                Ontdek de eilanden
              </Link>
              <Link
                href={langHref(lang, "/for-business")}
                className="inline-flex items-center rounded-full border border-teal-500/70 bg-white px-5 py-2.5 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-50"
              >
                Ik ben ondernemer
              </Link>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Gratis vermelding voor nieuwe bedrijven in de eerste 6 maanden.
            </p>
          </div>

          {/* Highlight card */}
          <div className="relative">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-teal-500/10 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
                Voor toeristen
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">
                Plan je reis met lokale kennis
              </h2>
              <p className="mt-3 text-sm text-slate-700">
                Filter op budget, eiland, categorie en voorzieningen. Sla je
                favorieten op en vind deals die je niet in de standaard
                reisgidsen ziet.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>• Lokale tips en “hidden gems”</li>
                <li>• Duik- &amp; snorkelspots met waarschuwingen</li>
                <li>• Gecontroleerde bedrijven &amp; reviews</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Eilanden overview */}
        <section className="pb-14">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Kies je eiland
            </h2>
            <Link
              href={langHref(lang, "/islands")}
              className="text-xs font-semibold text-teal-600 transition-colors hover:text-teal-700 sm:text-sm"
            >
              Bekijk alle eilanden →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {islands.map((island) => (
              <Link
                key={island.id}
                href={langHref(lang, `/islands?island=${island.id}`)}
                className="group rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm transition-all hover:-translate-y-[2px] hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
                  {island.tagline}
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  {island.name}
                </h3>
                <p className="mt-2 text-sm text-slate-700">{island.blurb}</p>
                <p className="mt-3 text-xs font-semibold text-teal-600 transition-colors group-hover:text-teal-700">
                  Ontdek adressen →
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Voor ondernemers blok */}
        <section className="mb-16 rounded-3xl border border-slate-200 bg-gradient-to-r from-sky-50 to-teal-50 px-6 py-8 sm:px-8">
          <div className="grid gap-6 md:grid-cols-[1.4fr,1fr] md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                Voor lokale ondernemers
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Laat toeristen jou vinden – niet andersom.
              </h2>
              <p className="mt-3 max-w-lg text-sm text-slate-700">
                Maak in een paar minuten een bedrijfsprofiel, upload foto&apos;s,
                voeg voorzieningen toe en kies later een abonnement dat past bij
                jouw doelen.
              </p>
              <ul className="mt-3 space-y-1 text-sm text-slate-700">
                <li>• Eerste 6 maanden gratis vermelding</li>
                <li>• WhatsApp &amp; website links</li>
                <li>• Optioneel mini-site &amp; reviews (Pro)</li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href={langHref(lang, "/business/auth")}
                className="inline-flex items-center justify-center rounded-full bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-600"
              >
                Registreer je bedrijf
              </Link>
              <Link
                href={langHref(lang, "/for-business")}
                className="text-center text-xs text-slate-600 transition-colors hover:text-slate-800"
              >
                Meer info over pakketten →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}