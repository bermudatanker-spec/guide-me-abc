// src/components/home/LocalTips.tsx
"use client";

import Link from "next/link";
import ResponsiveImage from "@/components/ResponsiveImage";
import { formatDate } from "@/lib/formatDate";

type Props = {
  lang: string;
};

/**
 * Zelfde posts als op /[lang]/blog
 * (eventueel later vervangen door data uit Supabase/CMS)
 */
const POSTS = [
  {
    slug: "hidden-gems-aruba",
    title: "10 Hidden Gems in Aruba You Must Visit",
    excerpt:
      "Discover the secret beaches, local restaurants, and unique experiences most tourists miss.",
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&auto=format&fit=crop",
    date: "2025-01-05",
    tag: "Guide",
  },
  {
    slug: "diving-guide-bonaire",
    title: "The Ultimate Diving Guide to Bonaire",
    excerpt:
      "Everything you need to know about exploring Bonaire's world-class coral reefs and marine life.",
    image:
      "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=1200&auto=format&fit=crop",
    date: "2025-01-03",
    tag: "Diving",
  },
  {
    slug: "budget-car-rental-curacao",
    title: "How to Rent a Car Cheaply in Curaçao",
    excerpt:
      "Pro tips for finding the best car rental deals and navigating Curaçao like a local.",
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&auto=format&fit=crop",
    date: "2025-01-01",
    tag: "Travel Tips",
  },
] as const;

export default function LocalTips({ lang }: Props) {
  return (
    <section className="space-y-3">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#2d303b] sm:text-xl">
          Laatste Guides & Tips
        </h2>

        <Link
          href={`/${lang}/blog`}
          className="text-xs sm:text-sm font-semibold text-[#00bfd3] hover:underline"
        >
          Bekijk alle artikelen →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {POSTS.map((p) => (
          <Link
            key={p.slug}
            href={`/${lang}/blog/${p.slug}`}
            className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-[2px] hover:shadow-md"
          >
            <div className="relative h-40 w-full">
              <ResponsiveImage
                src={p.image}
                alt={p.title}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                {p.tag}
              </span>
            </div>

            <div className="flex flex-col gap-2 p-4">
              <h3 className="text-sm font-semibold text-[#2d303b]">
                {p.title}
              </h3>
              <p className="text-sm text-slate-600 line-clamp-3">
                {p.excerpt}
              </p>
              <span className="mt-1 text-xs text-slate-400">
  {formatDate(p.date)}
</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
