// src/components/home/LocalTips.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

type Props = {
  lang: string;
};

const tips = [
  {
    slug: "best-snorkel-spots-aruba",
    title: "Top 5 Snorkelspots op Aruba",
    excerpt:
      "Ontdek kristalhelder water, scheepswrakken en kleurrijke riffen met deze veilige snorkelplekken.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "local-food-curacao",
    title: "Lokale Keuken op Curaçao",
    excerpt:
      "Van stoba en karni tot krioyo street food – proef de échte smaken van het eiland.",
    image:
      "https://images.unsplash.com/photo-1474625343645-1b1aefd13731?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "hidden-gems-bonaire",
    title: "Verborgen Plekjes op Bonaire",
    excerpt:
      "Rustige baaien, zoutvlaktes, flamingo hotspots en plekken die je niet vindt in standaard reisgidsen.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  },
];

export default function LocalTips({ lang }: Props) {
  return (
    <section className="space-y-3">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#2d303b] sm:text-xl">
          Lokale Tips & Guides
        </h2>

        <Link
          href={`/${lang}/blog`}
          className="text-xs font-semibold text-[#00bfd3] hover:underline sm:text-sm"
        >
          Bekijk alle tips →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {tips.map((tip) => (
          <article
            key={tip.slug}
            className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative h-40 w-full">
              <Image
                src={tip.image}
                alt={tip.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex flex-col gap-2 p-4">
              <h3 className="text-md font-semibold text-[#2d303b]">
                {tip.title}
              </h3>
              <p className="text-sm text-slate-600">{tip.excerpt}</p>

              <Link
                href={`/${lang}/blog/${tip.slug}`}
                className="mt-auto text-xs font-semibold text-[#00bfd3] hover:underline"
              >
                Lees verder →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
