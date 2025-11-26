// src/components/home/QuickFilters.tsx
"use client";

import { Umbrella, Utensils, Ship, BedDouble } from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";

type Props = { lang: Locale };

const filters = [
  {
    icon: Umbrella,
    slug: "beaches",
    label: {
      nl: "Stranden & natuur",
      en: "Beaches & Nature",
    },
  },
  {
    icon: Utensils,
    slug: "food-drinks",
    label: {
      nl: "Eten & drinken",
      en: "Food & Drinks",
    },
  },
  {
    icon: Ship,
    slug: "tours",
    label: {
      nl: "Tours & activiteiten",
      en: "Tours & Activities",
    },
  },
  {
    icon: BedDouble,
    slug: "stays",
    label: {
      nl: "Verblijf & huur",
      en: "Stays & Rentals",
    },
  },
] as const;

export default function QuickFilters({ lang }: Props) {
  const pickLabel = (lbl: { nl: string; en: string }) =>
    lang === "nl" ? lbl.nl : lbl.en;

  return (
    <section
      aria-label="Quick filters for categories"
      className="mt-6"
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {filters.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.slug}
              href={`/${lang}/categories/${item.slug}`}
              className="group flex flex-col items-center justify-center gap-2
                rounded-2xl bg-white shadow-sm border border-slate-100
                py-4 transition-all active:scale-[0.97]
                hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="rounded-full bg-[#00bfd3]/10 p-2 group-hover:bg-[#00bfd3]/20 transition">
                <Icon className="h-6 w-6 text-[#00bfd3]" />
              </div>
              <span className="text-xs font-semibold text-center text-[#2d303b]">
                {pickLabel(item.label)}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}