// components/home/FeaturedExperiences.tsx
"use client";

import Image from "next/image";

type Experience = {
  id: string;
  title: string;
  island: string;
  category: string;
  price: string;
  rating: number;
  badge: string;
  image: string;
};

const EXPERIENCES: Experience[] = [
  {
    id: "sunset-catamaran",
    title: "Sunset Beach Catamaran Tour",
    island: "Aruba",
    category: "Activity",
    price: "€75",
    rating: 4.9,
    badge: "Popular",
    image: "/images/sunset-beach-aruba.jpg",
  },
  {
    id: "seafood-grill",
    title: "Palm Beach Seafood Grill",
    island: "Aruba",
    category: "Restaurant",
    price: "€€€",
    rating: 4.7,
    badge: "Featured",
    image: "/images/palmbeach-seafood-grill-aruba.jpg",
  },
  {
    id: "bonaire-diving",
    title: "Bonaire Diving Adventure",
    island: "Bonaire",
    category: "Activity",
    price: "€95",
    rating: 5.0,
    badge: "Top Rated",
    image: "/images/scuba-diving-bonaire.jpg",
  },
  {
    id: "willemstad-walk",
    title: "Willemstad Walking Tour",
    island: "Curaçao",
    category: "Activity",
    price: "€35",
    rating: 4.8,
    badge: "New",
    image: "/images/curacao-city.jpg",
  },
];

export default function FeaturedExperiences() {
  return (
    <section className="py-12">
      <h2 className="mb-6 text-2xl font-bold text-foreground">
        Featured Experiences
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {EXPERIENCES.map((item) => (
          <article
            key={item.id}
            className="h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-lg"
          >
            <div className="relative h-40 w-full overflow-hidden rounded-t-xl">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>

            <div className="space-y-2 p-4">
              <div className="text-xs font-medium uppercase text-primary">
                {item.badge}
              </div>

              <h3 className="text-lg font-semibold text-foreground">
                {item.title}
              </h3>

              <p className="text-sm text-muted-foreground">
                {item.island} • {item.category}
              </p>

              <p className="text-sm font-medium">{item.price}</p>
              <p className="text-sm text-yellow-500">⭐ {item.rating}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}