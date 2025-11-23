// app/[lang]/blog/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ResponsiveImage from "@/components/ResponsiveImage";
import ShareBar from "./ShareBar";
import { isLocale, type Locale } from "@/i18n/config";

/** Demo data */
const blogPosts = {
  "hidden-gems-aruba": {
    title: "10 Hidden Gems in Aruba You Must Visit",
    author: "Maria Rodriguez",
    date: "2025-01-05",
    readTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&auto=format&fit=crop",
    tags: ["Aruba", "Travel Tips", "Beaches"],
    content: `<p>Aruba is known for its beautiful beaches...</p>`,
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

/* SEO */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale; slug: PostKey }>;
}): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  const lang = isLocale(raw) ? raw : "en";
  const post = blogPosts[slug];
  if (!post) return { title: "Post not found" };

const desc = post.content.replace(/<[^>]+>/g, "").slice(0, 160);

// 👇 expliciet typen, zodat TS niet zeurt over "pap"
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
    languages, // ⬅ hier gebruiken we de getypte const
  },
  openGraph: {
    title: post.title,
    description: desc,
    url: `/${lang}/blog/${slug}`,
    images: [{ url: post.image }],
  },
};
}

type PageProps = {
  params: { lang: Locale; slug: PostKey };
};

export default function BlogPostPage({ params }: PageProps) {
  const rawLang = params.lang;
  const slug = params.slug;
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
              priority
              sizes="(max-width: 768px) 100vw, 1024px"
              className="object-cover"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-500">
            <span>{post.author}</span>
            <span>{new Date(post.date).toLocaleDateString()}</span>
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

          {post.relatedPosts.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-6 text-2xl font-bold text-[#2d303b]">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {post.relatedPosts.map((s) => {
                  const rel = blogPosts[s as PostKey];
                  if (!rel) return null;
                  return (
                    <Link
                      key={s}
                      href={`/${lang}/blog/${s}`}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-[2px] hover:shadow-md"
                    >
                      <div className="relative h-32 w-full overflow-hidden">
                        <ResponsiveImage
                          src={rel.image}
                          alt={rel.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="line-clamp-2 text-sm font-semibold text-[#2d303b]">
                          {rel.title}
                        </h3>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </article>
      </main>
    </div>
  );
}
