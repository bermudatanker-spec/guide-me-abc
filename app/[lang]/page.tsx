// app/[lang]/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { langHref } from "@/lib/lang-href";

export const metadata: Metadata = {
  title: "Guide Me ABC – Ontdek Aruba, Bonaire & Curaçao",
  description:
    "Vind lokale bedrijven, activiteiten en hidden gems op Aruba, Bonaire en Curaçao. Voor toeristen én lokale ondernemers.",
};

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

export default function LangHome({
  params,
}: {
  params: { lang: string };
}) {
  const lang = params.lang;

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="grid gap-10 py-10 lg:grid-cols-[1.4fr,1fr] lg:items-center">
        <div>
          <p className="mb-3 inline-flex rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-800">
            Nieuwe generatie eilandgids
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Ontdek de beste lokale adressen op{" "}
            <span className="text-teal-600">Aruba, Bonaire &amp; Curaçao</span>.
          </h1>
          <p className="text-base sm:text-lg text-slate-700 max-w-xl">
            Eén platform voor alles: restaurants, autoverhuur, tours, duikshops,
            hidden gems en meer. Gekeurd, beoordeeld en gemaakt voor echte
            eilandliefhebbers.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={langHref(lang, "/islands")}
              className="inline-flex items-center rounded-full bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-600 transition-colors"
            >
              Ontdek de eilanden
            </Link>
            <Link
              href={langHref(lang, "/for-business")}
              className="inline-flex items-center rounded-full border border-teal-500/70 bg-white px-5 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-50 transition-colors"
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
          <div className="rounded-3xl bg-white shadow-lg shadow-teal-500/10 border border-slate-100 p-6 sm:p-8">
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
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Kies je eiland
          </h2>
          <Link
            href={langHref(lang, "/islands")}
            className="text-xs sm:text-sm font-semibold text-teal-600 hover:text-teal-700"
          >
            Bekijk alle eilanden →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {islands.map((island) => (
            <Link
              key={island.id}
              href={langHref(lang, `/islands?island=${island.id}`)}
              className="group rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
                {island.tagline}
              </p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">
                {island.name}
              </h3>
              <p className="mt-2 text-sm text-slate-700">{island.blurb}</p>
              <p className="mt-3 text-xs font-semibold text-teal-600 group-hover:text-teal-700">
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
            <p className="mt-3 text-sm text-slate-700 max-w-lg">
              Maak in een paar minuten een bedrijfsprofiel, upload foto&apos;s,
              voeg voorzieningen toe en kies later een abonnement dat past bij
              jouw doelen.
            </p>
            <ul className="mt-3 text-sm text-slate-700 space-y-1">
              <li>• Eerste 6 maanden gratis vermelding</li>
              <li>• WhatsApp &amp; website links</li>
              <li>• Optioneel mini-site &amp; reviews (Pro)</li>
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href={langHref(lang, "/business/auth")}
              className="inline-flex items-center justify-center rounded-full bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-600 transition-colors"
            >
              Registreer je bedrijf
            </Link>
            <Link
              href={langHref(lang, "/for-business")}
              className="text-xs text-slate-600 hover:text-slate-800 text-center"
            >
              Meer info over pakketten →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}