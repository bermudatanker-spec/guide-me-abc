"use client";

import { Umbrella, Utensils, Ship, BedDouble } from "lucide-react";
import Link from "next/link";

type Props = { lang: string };

const filters = [
  {
    icon: Umbrella,
    label: "Beaches & Nature",
    slug: "beaches",
  },
  {
    icon: Utensils,
    label: "Food & Drinks",
    slug: "food-drinks",
  },
  {
    icon: Ship,
    label: "Tours & Activities",
    slug: "tours",
  },
  {
    icon: BedDouble,
    label: "Stays & Rentals",
    slug: "stays",
  },
];

export default function QuickFilters({ lang }: Props) {
  return (
    <section aria-label="Quick filters for categories" className="mt-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {filters.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.slug}
              href={`/${lang}/categories/${item.slug}`}
              className="group flex flex-col items-center justify-center
                gap-2 rounded-2xl bg-white shadow-sm border border-slate-100
                py-4 transition-all active:scale-[0.97]
                hover:shadow-md hover:-translate-y-0.5"
            >
              {/* Icon bubble */}
              <div className="rounded-full bg-[#00bfd3]/10 p-2 group-hover:bg-[#00bfd3]/20 transition">
                <Icon className="w-6 h-6 text-[#00bfd3]" />
              </div>

              {/* Label */}
              <span className="text-xs font-semibold text-center text-[#2d303b]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}