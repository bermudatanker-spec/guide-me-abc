// src/components/home/FeaturedExperiences.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

type Props = { lang: string };

const experiences = [
  {
    slug: "scuba-diving-bonaire",
    title: "Scuba Diving – Bonaire",
    island: "Bonaire",
    image: "/images/scuba-diving-bonaire.jpg",
    priceFrom: "$89",
    rating: 4.9,
  },
  {
    slug: "sunset-sailing-cruise",
    title: "Sunset Sailing Cruise",
    island: "Aruba",
    image: "/images/sunset-sailing-cruise.jpg",
    priceFrom: "$75",
    rating: 4.8,
  },
  {
    slug: "curacao-street-food-tour",
    title: "Street Food & Culture Tour",
    island: "Curaçao",
    image: "/images/curacao-punda.jpg",
    priceFrom: "$65",
    rating: 4.7,
  },
];

export default function FeaturedExperiences({ lang }: Props) {
  return (
    <section aria-labelledby="featured-experiences">
      <div className="flex items-center justify-between mb-3">
        <h2
          id="featured-experiences"
          className="text-lg sm:text-xl font-semibold text-[#2d303b]"
        >
          Uitgelichte Ervaringen
        </h2>
        <Link
          href={`/${lang}/experiences`}
          className="text-xs font-semibold text-[#00bfd3] hover:underline sm:text-sm"
        >
          Bekijk alle →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {experiences.map((exp) => (
          <article
            key={exp.slug}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-[2px] transition-all flex flex-col"
          >
            <div className="relative h-40 w-full">
              <Image
                src={exp.image}
                alt={exp.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-4 flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{exp.island}</span>
                <span>⭐ {exp.rating}</span>
              </div>

              <h3 className="font-semibold text-sm text-[#2d303b]">
                {exp.title}
              </h3>

              <p className="text-xs text-slate-500">Vanaf {exp.priceFrom}</p>

              <div className="mt-auto pt-2">
                <Link
                  href={`/${lang}/experiences/${exp.slug}`}
                  className="inline-flex text-xs font-semibold text-[#00bfd3] hover:underline"
                >
                  Bekijk details →
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
