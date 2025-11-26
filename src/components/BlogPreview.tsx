"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, User } from "lucide-react";
import { getLangFromPath } from "@/lib/locale-path";
import { formatDate } from "@/lib/formatDate";

export type BlogCard = {
  title: string;
  excerpt: string;
  href: string;        // zonder taalprefix, bv. "/blog/hidden-gems-aruba"
  tag?: string;
  image?: string;
  author?: string;
  date?: string;       // ISO "2025-01-05" (optioneel)
};

/** ==== Defaults die overeenkomen met je echte posts/slugs ==== */
const DEFAULT_POSTS: BlogCard[] = [
  {
    title: "10 Hidden Gems in Aruba You Must Visit",
    excerpt:
      "Discover the secret beaches, local restaurants, and unique experiences most tourists miss.",
    href: "/blog/hidden-gems-aruba",
    tag: "Guide",
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&auto=format&fit=crop",
    author: "Maria Rodriguez",
    date: "2025-01-05",
  },
  {
    title: "The Ultimate Diving Guide to Bonaire",
    excerpt:
      "Everything you need to know about exploring Bonaire's world-class coral reefs and marine life.",
    href: "/blog/diving-guide-bonaire",
    tag: "Diving",
    image:
      "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=1200&auto=format&fit=crop",
    author: "John van der Berg",
    date: "2025-01-03",
  },
  {
    title: "How to Rent a Car Cheaply in Curaçao",
    excerpt:
      "Pro tips for finding the best car rental deals and navigating Curaçao like a local.",
    href: "/blog/budget-car-rental-curacao",
    tag: "Travel Tips",
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&auto=format&fit=crop",
    author: "Sophie Martinez",
    date: "2025-01-01",
  },
];

/** Fallback als een kaart geen image meekrijgt */
const IMAGE_BY_SLUG: Record<string, string> = {
  "hidden-gems-aruba":
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&auto=format&fit=crop",
  "diving-guide-bonaire":
    "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=1200&auto=format&fit=crop",
  "budget-car-rental-curacao":
    "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&auto=format&fit=crop",
};
const FALLBACK_IMAGE = "/images/blog-fallback.jpg";

export default function BlogPreview({
  posts = DEFAULT_POSTS,
  title = "Latest Guides & Tips",
}: {
  posts?: BlogCard[];
  title?: string;
}) {
  const pathname = usePathname() ?? "/";
  const lang = getLangFromPath(pathname);

  // href taalbewust maken
  const withLang = (href: string) => {
    if (!href.startsWith("/")) return `/${lang}/${href}`;
    const seg = href.split("/")[1];
    if (["en", "nl", "pap", "es"].includes(seg)) return href;
    return `/${lang}${href}`;
  };

  const getImage = (p: BlogCard) => {
    if (p.image) return p.image;
    const slug = (p.href.split("/").pop() || "").toLowerCase();
    return IMAGE_BY_SLUG[slug] ?? FALLBACK_IMAGE;
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-foreground">{title}</h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => {
            const href = withLang(p.href);
            const img = getImage(p);
            return (
              <article
                key={p.href}
                className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-[var(--shadow-card)]"
              >
                {/* Afbeelding */}
                <Link href={href} aria-label={p.title}>
                  <div
                    className="h-48 w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.02]"
                    style={{ backgroundImage: `url(${img})` }}
                  />
                </Link>

                {/* Content */}
                <div className="p-4">
                  {p.tag && (
                    <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {p.tag}
                    </span>
                  )}

                  <h3 className="mt-2 text-lg font-semibold text-foreground">
                    <Link href={href} className="hover:underline">
                      {p.title}
                    </Link>
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">{p.excerpt}</p>

                  {(p.author || p.date) && (
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      {p.author && (
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {p.author}
                        </span>
                      )}
                      {p.date && (
                        <span className="mt-1 text-xs text-slate-400">
  {formatDate(p.date)}
</span>
                      )}
                    </div>
                  )}

                  <Link
                    href={href}
                    className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                  >
                    Read more
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}