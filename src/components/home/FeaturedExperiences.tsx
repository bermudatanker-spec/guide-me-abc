// src/components/home/FeaturedExperiences.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

type Props = { lang: string };

const experiences = [
  {
    slug: "scuba-diving-aruba",
    title: "Scuba Diving – Aruba",
    island: "Aruba",
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=80",
    priceFrom: "$89",
    rating: 4.9,
  },
  {
    slug: "sunset-sailing-bonaire",
    title: "Sunset Sailing Cruise",
    island: "Bonaire",
    image:
      "https://images.unsplash.com/photo-1500375592092-8c5f1cbd8761?auto=format&fit=crop&w=900&q=80",
    priceFrom: "$75",
    rating: 4.8,
  },
  {
    slug: "curacao-street-food-tour",
    title: "Street Food & Culture Tour",
    island: "Curaçao",
    image:
      "https://images.unsplash.com/photo-1518831959410-48a93438a87f?auto=format&fit=crop&w=900&q=80",
    priceFrom: "$65",
    rating: 4.7,
  },
];

export default function FeaturedExperiences({ lang }: Props) {
  return (
    <section
      aria-labelledby="featured-experiences"
      className="space-y-3"
    >
      <div className="mb-1 flex items-center justify-between">
        <h2
          id="featured-experiences"
          className="text-lg font-semibold text-[#2d303b]"
        >
          Featured Experiences
        </h2>
        <Link
          href={`/${lang}/experiences`}
          className="text-xs font-semibold text-[#00bfd3] hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {experiences.map((exp) => (
          <article
            key={exp.slug}
            className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative h-40 w-full">
              <Image
                src={exp.image}
                alt={`${exp.title} in ${exp.island}`}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{exp.island}</span>
                <span aria-label={`${exp.rating} out of 5 stars`}>
                  ⭐ {exp.rating.toFixed(1)}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-[#2d303b]">
                {exp.title}
              </h3>

              <p className="text-xs text-slate-500">
                From <span className="font-semibold">{exp.priceFrom}</span>
              </p>

              <div className="mt-auto pt-2">
                <Link
                  href={`/${lang}/experiences/${exp.slug}`}
                  className="inline-flex text-xs font-semibold text-[#00bfd3] hover:underline"
                >
                  View details
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
