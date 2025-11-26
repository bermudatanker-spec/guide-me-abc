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

export default function FeaturedHighlights() {
  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Featured Experiences
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {EXPERIENCES.map((item) => (
          <article
            key={item.id}
            className="rounded-xl bg-card border border-border shadow-sm transition hover:shadow-lg"
          >
            <div className="relative h-40 w-full rounded-t-xl overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-4 space-y-2">
              <div className="text-xs uppercase font-medium text-primary">
                {item.badge}
              </div>

              <h3 className="font-semibold text-foreground text-lg">
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
