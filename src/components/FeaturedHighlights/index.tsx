"use client";

type Highlight = {
  title: string;
  excerpt: string;
};

const DEFAULT_HIGHLIGHTS: Highlight[] = [
  { title: "Top snorkeling spots", excerpt: "Crystal-clear waters and vibrant reefs." },
  { title: "Local food to try", excerpt: "Pastechi, stoba and fresh seafood." },
  { title: "Hidden coves in Curaçao", excerpt: "Secluded beaches off the beaten path." },
];

export default function FeaturedHighlights({
  items = DEFAULT_HIGHLIGHTS,
  title = "Featured highlights",
}: {
  items?: Highlight[];
  title?: string;
}) {
  return (
    <section className="py-12">
      <h2 className="mb-6 text-2xl font-bold text-foreground">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((h, i) => (
          <article
            key={i}
            className="rounded-xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md"
          >
            <h3 className="font-semibold text-foreground">{h.title}</h3>
            <p className="text-sm text-muted-foreground">{h.excerpt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}