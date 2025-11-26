// app/[lang]/blog/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import ResponsiveImage from "@/components/ResponsiveImage";
import { isLocale, type Locale } from "@/i18n/config";
import { formatDate } from "@/lib/formatDate";

/* Demo content – later vervangen door CMS/Supabase data */
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
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "en";

  const title = "Blog & Guides | Guide Me ABC";
  const description =
    "Latest travel guides, island tips, and local insights from Aruba, Bonaire & Curaçao.";

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
    openGraph: {
      title,
      description,
      url: `/${lang}/blog`,
    },
  };
}

/* Page */
type PageProps = {
  params: { lang: Locale };
};

export default function BlogIndex({ params }: PageProps) {
  const raw = params.lang;
  const lang = isLocale(raw) ? raw : "en";

  return (
    <div className="min-h-screen bg-slate-50 text-[#2d303b]">
      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16 sm:px-6 lg:px-10">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#00bfd3]">
            Guides & Tips
          </p>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
            Latest Guides & Tips
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base max-w-2xl">
            Inspiration, local knowledge and practical advice for exploring
            Aruba, Bonaire & Curaçao like a local.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {POSTS.map((p) => (
            <Link
              key={p.slug}
              href={`/${lang}/blog/${p.slug}`}
              className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-[2px] hover:shadow-md"
            >
              <div className="relative aspect-[16/10]">
                <ResponsiveImage
                  src={p.image}
                  alt={p.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority={false}
                />
                <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                  {p.tag}
                </span>
              </div>
              <div className="p-5">
                <h2 className="text-lg font-semibold">{p.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                  {p.excerpt}
                </p>
                <div className="mt-3 text-xs text-slate-400">
                  {formatDate(p.date)}
                </div>
              </div>
            </Link>
          ))}
        </section>

        {/* (optionele) pagination placeholder */}
        <div className="mt-10 flex justify-center gap-2 text-sm">
          <span className="rounded border bg-white px-3 py-1">1</span>
          <button className="rounded border px-3 py-1 hover:bg-slate-100">
            2
          </button>
          <button className="rounded border px-3 py-1 hover:bg-slate-100">
            Next →
          </button>
        </div>
      </main>
    </div>
  );
}