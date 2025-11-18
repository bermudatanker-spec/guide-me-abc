import type { Metadata } from "next";
import ResponsiveImage from "@/components/ResponsiveImage";
import Link from "next/link";
import { notFound } from "next/navigation";
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

export async function generateMetadata(
  { params }: { params: Promise<{ lang: Locale; slug: PostKey }> }
): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  const lang = isLocale(raw) ? raw : "en";
  const post = blogPosts[slug];
  if (!post) return { title: "Post not found" };

  const desc = post.content.replace(/<[^>]+>/g, "").slice(0, 160);

  return {
    title: post.title,
    description: desc,
    alternates: {
      canonical: `/${lang}/blog/${slug}`,
      languages: {
        en: `/en/blog/${slug}`,
        nl: `/nl/blog/${slug}`,
        pap: `/pap/blog/${slug}`,
        es: `/es/blog/${slug}`,
      } as Record<string, string>,
    },
    openGraph: {
      title: post.title,
      description: desc,
      url: `/${lang}/blog/${slug}`,
      images: [{ url: post.image }],
    },
  };
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ lang: Locale; slug: PostKey }> }
) {
  const { lang: raw, slug } = await params;
  const lang = isLocale(raw) ? raw : "en";
  const post = blogPosts[slug];
  if (!post) return notFound();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <Link href={`/${lang}/blog`} className="inline-flex items-center gap-2 text-sm hover:underline mb-6">
          ← Back to Blog
        </Link>

        <article className="max-w-4xl mx-auto">
          <div className="relative h-96 w-full overflow-hidden rounded-xl border">
            <ResponsiveImage
              src={post.image}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1024px"
              className="object-cover"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>{post.author}</span>
            <span>{new Date(post.date).toLocaleDateString()}</span>
            <span>{post.readTime}</span>
          </div>

          <h1 className="mt-3 text-4xl md:text-5xl font-bold text-foreground">{post.title}</h1>

          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs text-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          <ShareBar title={post.title} />

          <div
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {post.relatedPosts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {post.relatedPosts.map((s) => {
                  const rel = blogPosts[s as PostKey];
                  if (!rel) return null;
                  return (
                    <Link
                      key={s}
                      href={`/${lang}/blog/${s}`}
                      className="rounded-xl border bg-card hover:shadow-md transition"
                    >
                      <div className="relative h-32 w-full overflow-hidden rounded-t-xl">
                        <ResponsiveImage
                          src={rel.image}
                          alt={rel.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground line-clamp-2">{rel.title}</h3>
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