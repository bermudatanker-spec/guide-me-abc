// app/[lang]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import ResponsiveImage from "@/components/ResponsiveImage"; // <-- pas aan als jouw pad anders is

import { DICTS } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import Hero from "@/components/Hero";
import BlogPreview, { type BlogCard } from "@/components/BlogPreview";
import SearchBar from "@/components/SearchBar";

/* ───────────────── Types & helpers ───────────────── */
type ParamsPromise = Promise<{ lang: string }>;

function resolveLang(raw?: string): Locale {
  return isLocale(raw as any) ? (raw as Locale) : "en";
}

// Voor responsive Next <Image /> warnings
const FEATURED_SIZES =
  "(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw";
const ISLAND_CARD_SIZES =
  "(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw";

function tagColor(tag?: string) {
  switch (tag) {
    case "Popular":
      return "bg-orange-500";
    case "Featured":
      return "bg-blue-600";
    case "Top Rated":
      return "bg-emerald-600";
    default:
      return "bg-pink-600";
  }
}

/* ─────────────── Metadata ─────────────── */
export async function generateMetadata(
  { params }: { params: ParamsPromise }
): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = resolveLang(raw);
  const t = DICTS[lang] ?? DICTS.en;

  const title = `Guide Me ABC — ${t.exploreIslands ?? "Discover the ABC Islands"}`;
  const description =
    t.faqSubtitle ?? "Your guide to Aruba, Bonaire & Curaçao.";

  // los getypt zodat 'pap' gewoon mag
  const languages: Record<string, string> = {
    en: "/en",
    nl: "/nl",
    pap: "/pap",
    es: "/es",
  };

  return {
    title,
    description,
    alternates: { languages },
    openGraph: { title, description, url: `/${lang}` },
  };
}

/* ─────────────── Page ─────────────── */
export default async function HomePage({ params }: { params: ParamsPromise }) {
  const { lang: raw } = await params;
  const lang = resolveLang(raw);
  const t = DICTS[lang] ?? DICTS.en;

  /* ---------- Data ---------- */
  const featured = [
    {
      title: "Sunset Beach Catamaran Tour",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop",
      tag: "Popular",
      category: "Activity",
      location: "Aruba",
      rating: 4.9,
      price: "€75",
    },
    {
      title: "Palm Beach Seafood Grill",
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop",
      tag: "Featured",
      category: "Restaurant",
      location: "Aruba",
      rating: 4.7,
      price: "€€€",
    },
    {
      title: "Bonaire Diving Adventure",
      image:
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop",
      tag: "Top Rated",
      category: "Activity",
      location: "Bonaire",
      rating: 5.0,
      price: "€95",
    },
    {
      title: "Willemstad Walking Tour",
      image:
        "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&auto=format&fit=crop",
      tag: "New",
      category: "Activity",
      location: "Curaçao",
      rating: 4.8,
      price: "€35",
    },
  ] as const;

  const islandCards = [
    {
      slug: "aruba",
      title: t.aruba ?? "Aruba",
      tagline: "One Happy Island",
      img: "/images/aruba-island.jpg",
      blurb:
        "Known for its pristine white-sand beaches and year-round sunshine, Aruba offers the perfect blend of relaxation and adventure.",
      highlights: [
        "Eagle Beach – ranked among the world’s best beaches",
        "Arikok National Park’s desert landscape",
        "Vibrant nightlife and luxury resorts",
      ],
    },
    {
      slug: "bonaire",
      title: t.bonaire ?? "Bonaire",
      tagline: "Diver’s Paradise",
      img: "/images/bonaire-island.jpg",
      blurb:
        "A UNESCO World Heritage site with pristine coral reefs and top-tier diving locations.",
      highlights: [
        "1000 Steps dive site with crystal-clear waters",
        "Marine Park protecting colorful reefs",
        "Tranquil vibe ideal for nature lovers",
      ],
    },
    {
      slug: "curacao",
      title: t.curacao ?? "Curaçao",
      tagline: "Colorful Caribbean",
      img: "/images/curacao-island.jpg",
      blurb:
        "Famous for its vibrant culture, pastel-colored colonial architecture, and rich fusion of Caribbean and Dutch heritage.",
      highlights: [
        "UNESCO-listed Willemstad historic center",
        "35+ stunning beaches",
        "Vibrant art & culinary scene",
      ],
    },
  ] as const;

  const blogCards: BlogCard[] = [
    {
      title: "10 Hidden Gems in Aruba You Must Visit",
      excerpt:
        "Discover the secret beaches, local restaurants, and unique experiences most tourists miss.",
      href: `/${lang}/blog/hidden-gems-aruba`,
      tag: "Guide",
    },
    {
      title: "The Ultimate Diving Guide to Bonaire",
      excerpt:
        "Everything you need to know about exploring Bonaire's coral reefs and marine life.",
      href: `/${lang}/blog/diving-guide-bonaire`,
      tag: "Diving",
    },
    {
      title: "How to Rent a Car Cheaply in Curaçao",
      excerpt:
        "Tips for finding the best deals and navigating Curaçao like a local.",
      href: `/${lang}/blog/budget-car-rental-curacao`,
      tag: "Travel Tips",
    },
  ];

  /* ---------- Render ---------- */
  return (
    <>
      <Hero />
      <SearchBar />

      {/* Featured Experiences */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-8 text-foreground text-center">
          Featured Experiences
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((f, i) => (
            <article
              key={`${f.title}-${i}`}
              className="overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="relative h-56">
                <ResponsiveImage
                  src={f.image}
                  alt={f.title}
                  sizes={FEATURED_SIZES}
                  className="group-hover:scale-105 transition-transform duration-500"
                />
                {f.tag && (
                  <span
                    className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full text-white ${tagColor(
                      f.tag
                    )}`}
                  >
                    {f.tag}
                  </span>
                )}
              </div>

              <div className="p-5">
                <p className="text-xs uppercase text-muted-foreground mb-1 tracking-wide">
                  {f.category}
                </p>
                <h3 className="font-semibold text-lg mb-1 text-foreground">
                  {f.title}
                </h3>

                <div className="text-sm text-muted-foreground flex justify-between mb-2">
                  <span>{f.location}</span>
                  <span>⭐ {f.rating}</span>
                </div>

                <div className="font-medium text-primary">{f.price}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Explore the Islands */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold mb-8 text-foreground text-center">
          {t.exploreIslands ?? "Explore the Islands"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {islandCards.map((card) => (
            <article
              key={card.slug}
              className="rounded-2xl overflow-hidden border bg-card shadow-sm hover:shadow-md transition-all"
            >
              <div className="relative h-48">
                <ResponsiveImage
                  src={card.img}
                  alt={card.title}
                  sizes={ISLAND_CARD_SIZES}
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <h3 className="text-xl font-semibold">{card.title}</h3>
                  <p className="text-sm opacity-90">{card.tagline}</p>
                </div>
              </div>

              <div className="p-5 text-sm">
                <p className="mb-3 text-muted-foreground">{card.blurb}</p>

                <ul className="list-disc list-inside mb-5 text-muted-foreground/90 space-y-1">
                  {card.highlights.map((h, i) => (
                    <li key={`${card.slug}-h-${i}`}>{h}</li>
                  ))}
                </ul>

                <Link
                  href={`/${lang}/islands/${card.slug}`}
                  className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:opacity-95 hover:shadow-lg"
                >
                  Explore {card.title}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Blog */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <BlogPreview title="Latest Guides & Tips" posts={blogCards} />
      </section>
    </>
  );
}