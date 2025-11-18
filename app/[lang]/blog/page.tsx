import type { Metadata } from "next";
import ResponsiveImage from "@/components/ResponsiveImage";
import Link from "next/link";
import { isLocale, type Locale } from "@/i18n/config";

/* Demo content – vervang later door echte CMS/Supabase data */
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

/* SEO */
export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale }> }
): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "en";

  const title = "Blog & Guides | Guide Me ABC";
  const description = "Latest travel guides, island tips, and local insights from Aruba, Bonaire & Curaçao.";

  const languages: Record<string, string> = {
    en: "/en/blog",
    nl: "/nl/blog",
    pap: "/pap/blog",
    es: "/es/blog",
  };

  return {
    title,
    description,
    alternates: { languages },
    openGraph: { title, description, url: `/${lang}/blog` },
  };
}

/* Page */
export default async function BlogIndex(
  { params }: { params: Promise<{ lang: Locale }> }
) {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "en";

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <h1 className="text-4xl font-bold mb-8">Latest Guides & Tips</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {POSTS.map((p) => (
            <Link
              key={p.slug}
              href={`/${lang}/blog/${p.slug}`}
              className="group rounded-2xl overflow-hidden border bg-card hover:shadow-md transition-all"
            >
              <div className="relative aspect-[16/10]">
                <ResponsiveImage
                  src={p.image}
                  alt={p.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority={false}
                />
                <span className="absolute left-3 top-3 rounded-full bg-black/60 text-white text-xs px-2 py-1">
                  {p.tag}
                </span>
              </div>
              <div className="p-5">
                <h2 className="text-lg font-semibold">{p.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>
                <div className="mt-3 text-xs text-muted-foreground">
                  {new Date(p.date).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* (optionele) pagination placeholder */}
        <div className="mt-10 flex justify-center gap-2 text-sm">
          <span className="px-3 py-1 rounded border bg-card">1</span>
          <button className="px-3 py-1 rounded border hover:bg-accent">2</button>
          <button className="px-3 py-1 rounded border hover:bg-accent">Next →</button>
        </div>
      </main>
    </div>
  );
}