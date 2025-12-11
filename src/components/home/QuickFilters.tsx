// src/components/home/QuickFilters.tsx
"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { JSX } from "react";

import {
  UtensilsCrossed,
  Wine,
  SunMedium,
  MapPin,
  Users,
  MoonStar,
  Sparkles,
} from "lucide-react";

type FilterId =
  | "restaurants"
  | "bars"
  | "beaches"
  | "tours"
  | "family"
  | "nightlife"
  | "romantic";

type Quickfilter = {
  id: FilterId;
  label: string;
  sublabel: string;
};

type Props = {
  lang: Locale;
};

/* ==== Copy / labels per taal ==== */

const FILTERS_BY_LOCALE: Record<Locale, Quickfilter[]> = {
  en: [
    {
      id: "restaurants",
      label: "Restaurants",
      sublabel: "Local food & hidden gems",
    },
    {
      id: "bars",
      label: "Bars & beach clubs",
      sublabel: "Cocktails, sundowners & nightlife",
    },
    {
      id: "beaches",
      label: "Beaches",
      sublabel: "White sand & turquoise water",
    },
    {
      id: "tours",
      label: "Tours & activities",
      sublabel: "Boat trips, snorkeling, off-road",
    },
    {
      id: "family",
      label: "Family friendly",
      sublabel: "Kids’ activities & safe beaches",
    },
    {
      id: "nightlife",
      label: "Nightlife",
      sublabel: "Parties, clubs & live music",
    },
    {
      id: "romantic",
      label: "Romantic",
      sublabel: "Sunsets & date ideas",
    },
  ],
  nl: [
    {
      id: "restaurants",
      label: "Restaurants",
      sublabel: "Lokaal eten & verborgen parels",
    },
    {
      id: "bars",
      label: "Bars & beachclubs",
      sublabel: "Cocktails, sundowners & nightlife",
    },
    {
      id: "beaches",
      label: "Stranden",
      sublabel: "Witte zandstranden & blauw water",
    },
    {
      id: "tours",
      label: "Tours & activiteiten",
      sublabel: "Boottochten, snorkelen, off-road",
    },
    {
      id: "family",
      label: "Met de familie",
      sublabel: "Kidsproof uitjes & stranden",
    },
    {
      id: "nightlife",
      label: "Nightlife",
      sublabel: "Feestjes, clubs & live muziek",
    },
    {
      id: "romantic",
      label: "Romantisch",
      sublabel: "Zonsondergang & date-ideeën",
    },
  ],
  pap: [
    {
      id: "restaurants",
      label: "Restorantnan",
      sublabel: "Kuminda lokal i spotnan skondí",
    },
    {
      id: "bars",
      label: "Bar i beach club",
      sublabel: "Cocktail, sundowner i nightlife",
    },
    {
      id: "beaches",
      label: "Playanan",
      sublabel: "Playa blanku ku awa turkesa",
    },
    {
      id: "tours",
      label: "Tour i aktividad",
      sublabel: "Boat trip, snorkel i off-road",
    },
    {
      id: "family",
      label: "Famianan",
      sublabel: "Aktividad pa mucha i famia",
    },
    {
      id: "nightlife",
      label: "Nightlife",
      sublabel: "Fiesta, club i musik biba",
    },
    {
      id: "romantic",
      label: "Romántiko",
      sublabel: "Sunset i idea pa cita",
    },
  ],
  es: [
    {
      id: "restaurants",
      label: "Restaurantes",
      sublabel: "Comida local y sitios escondidos",
    },
    {
      id: "bars",
      label: "Bares y beach clubs",
      sublabel: "Cócteles, atardeceres y noche",
    },
    {
      id: "beaches",
      label: "Playas",
      sublabel: "Arena blanca y mar turquesa",
    },
    {
      id: "tours",
      label: "Tours y actividades",
      sublabel: "Paseos en barco, snorkel, off-road",
    },
    {
      id: "family",
      label: "En familia",
      sublabel: "Planes con niños y playas seguras",
    },
    {
      id: "nightlife",
      label: "Vida nocturna",
      sublabel: "Fiestas, clubs y música en vivo",
    },
    {
      id: "romantic",
      label: "Romántico",
      sublabel: "Atardeceres y citas",
    },
  ],
};

const TITLE: Record<Locale, string> = {
  en: "Quick filters",
  nl: "Snel kiezen",
  pap: "Filtronan rap",
  es: "Filtros rápidos",
};

const SUBTITLE: Record<Locale, string> = {
  en: "Tap a theme to instantly see matching places on the islands.",
  nl: "Tik een thema aan en zie direct passende plekken op de eilanden.",
  pap: "Klik riba un tema pa wak lugarnan ku ta klapa direkt.",
  es: "Toca un tema para ver al instante los lugares que encajan.",
};

/* iconen losgekoppeld zodat TS blij blijft */
const ICONS: Record<FilterId, JSX.Element> = {
  restaurants: <UtensilsCrossed className="h-5 w-5" />,
  bars: <Wine className="h-5 w-5" />,
  beaches: <SunMedium className="h-5 w-5" />,
  tours: <MapPin className="h-5 w-5" />,
  family: <Users className="h-5 w-5" />,
  nightlife: <MoonStar className="h-5 w-5" />,
  romantic: <Sparkles className="h-5 w-5" />,
};

export default function QuickFilters({ lang }: Props) {
  const router = useRouter();
  const filters = FILTERS_BY_LOCALE[lang] ?? FILTERS_BY_LOCALE.en;
  const title = TITLE[lang] ?? TITLE.en;
  const subtitle = SUBTITLE[lang] ?? SUBTITLE.en;

  const handleClick = (id: FilterId) => {
    const params = new URLSearchParams();
    params.set("quick", id); // /[lang]/search?quick=restaurants
    router.push(`/${lang}/search?${params.toString()}`);
  };

  return (
    <section className="py-10">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => handleClick(f.id)}
            className="group inline-flex min-w-[180px] items-center gap-3 rounded-full bg-white/80 px-4 py-3 text-left shadow-card backdrop-blur transition hover:-translate-y-0.5 hover:shadow-glow"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ocean-btn text-white shadow-glow">
              {ICONS[f.id]}
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                {f.label}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {f.sublabel}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}