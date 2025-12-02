// app/[lang]/blog/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ResponsiveImage from "@/components/ResponsiveImage";
import ShareBar from "./ShareBar";
import { isLocale, type Locale } from "@/i18n/config";
import { formatDate } from "@/lib/formatDate";

/* ------------ Demo data (zelfde keys als je slugs) ------------- */

const blogPosts = {
  "hidden-gems-aruba": {
    title: "10 Hidden Gems in Aruba You Must Visit",
    author: "Maria Rodriguez",
    date: "2025-01-05",
    readTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&auto=format&fit=crop",
    tags: ["Aruba", "Travel Tips", "Beaches"],
    content: `<p>Aruba is known for its beautiful beaches...</p>
w`,
    relatedPosts: ["diving-guide-bonaire"],
  },
  "diving-guide-bonaire": {
    title: "The Ultimate Diving Guide to Bonaire",
    author: "John van der Berg",
    date: "2025-01-03",
    readTime: "8 min read",
    image:
      "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=1200&auto=format&fit=crop",
    tags: ["Bonaire", "Diving", "Activities"],
    content: `<p>Bonaire is consistently ranked...</p>`,
    relatedPosts: ["hidden-gems-aruba", "budget-car-rental-curacao"],
  },
  "budget-car-rental-curacao": {
    title: "How to Rent a Car Cheaply in Curaçao",
    author: "Sophie Martinez",
    date: "2025-01-01",
    readTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&auto=format&fit=crop",
    tags: ["Curaçao", "Car Rentals", "Budget Travel"],
    content: `<p>Exploring Curaçao by car is the best way...</p>`,
    relatedPosts: [],
  },
} as const;

type PostKey = keyof typeof blogPosts;

/* --------- Type voor route-params (als Promise) ---------- */

type RouteParams = {
  lang: Locale;
  slug: PostKey;
};

type PageParamsPromise = {
  params: Promise<RouteParams>;
};

/* ---------------------- SEO metadata ---------------------- */

export async function generateMetadata(
  { params }: PageParamsPromise
): Promise<Metadata> {
  const { lang: rawLang, slug } = await params; // ✅ eerst await
  const lang = isLocale(rawLang) ? rawLang : "en";

  const post = blogPosts[slug];
  if (!post) {
    return {
      title: "Post not found | Guide Me ABC",
      description: "This article could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const desc = post.content.replace(/<[^>]+>/g, "").slice(0, 160);

  const languages: Record<string, string> = {
    en: `/en/blog/${slug}`,
    nl: `/nl/blog/${slug}`,
    pap: `/pap/blog/${slug}`,
    es: `/es/blog/${slug}`,
  };

  return {
    title: post.title,
    description: desc,
    alternates: {
      canonical: `/${lang}/blog/${slug}`,
      languages,
    },
    openGraph: {
      title: post.title,
      description: desc,
      url: `/${lang}/blog/${slug}`,
      images: [{ url: post.image }],
    },
  };
}

/* ------------------------ Page zelf ------------------------ */

export default async function BlogPostPage(
  { params }: PageParamsPromise
) {
  const { lang: rawLang, slug } = await params; // ✅ weer eerst await
  const lang = isLocale(rawLang) ? rawLang : "en";

  const post = blogPosts[slug];
  if (!post) return notFound();

  return (
    <div className="min-h-screen bg-slate-50 text-[#2d303b]">
      <main className="mx-auto max-w-5xl px-4 pt-24 pb-12 sm:px-6 lg:px-10">
        <Link
          href={`/${lang}/blog`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#00bfd3] hover:underline"
        >
          ← Back to Blog
        </Link>

        <article>
          <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-slate-200 sm:h-96">
            <ResponsiveImage
              src={post.image}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 1024px"
              className="object-cover"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-500">
            <span>{post.author}</span>
            <span className="mt-1 text-xs text-slate-400">
              {formatDate(post.date)}
            </span>
            <span>{post.readTime}</span>
          </div>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl md:text-5xl">
            {post.title}
          </h1>

          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Deelbalk */}
          <ShareBar title={post.title} />

          {/* Content */}
          <div
            className="prose prose-slate prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
    </div>
  );
}