// app/[lang]/biz/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isLocale, type Locale } from "@/i18n/config";
import { translations } from "@/i18n/translations";
import { supabaseServer } from "@/lib/supabase/server";

/* -------------------- Types -------------------- */

type Params = {
  lang: string;
  id: string;
};

// In Next 15/16 is params een Promise → daarom zo getypt
type PageProps = {
  params: Promise<Params>;
};

type BusinessRow = {
  id: string;
  business_name: string;
  description: string | null;
  island: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  whatsapp: string | null;
  subscription_plan: string | null;
  rating_avg: number | null;
  rating_count: number | null;
  category_name: string | null;
  category_slug: string | null;
};

/* ----------------- Metadata -------------------- */

export async function generateMetadata(
  props: PageProps
): Promise<Metadata> {
  // params-Promise eerst uitpakken ✅
  const { lang: rawLang, id } = await props.params;

  const lang: Locale = isLocale(rawLang) ? rawLang : "en";
  const t = translations[lang];

  const s = await supabaseServer();

  const { data } = await s
    .from("public_businesses")
    .select("business_name, description")
    .eq("id", id)
    .maybeSingle<Pick<BusinessRow, "business_name" | "description">>();

  const title =
    data?.business_name ??
    `${t.businesses ?? "Businesses"} | Guide Me ABC`;

  const description =
    data?.description ??
    "Discover trusted local businesses on the ABC Islands.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/biz/${id}`,
      languages: {
        en: `/en/biz/${id}`,
        nl: `/nl/biz/${id}`,
        pap: `/pap/biz/${id}`,
        es: `/es/biz/${id}`,
      } as Record<string, string>,
    },
    openGraph: {
      title,
      description,
      url: `/${lang}/biz/${id}`,
    },
  };
}

/* -------------------- Pagina ------------------- */

export default async function BizDetailPage(props: PageProps) {
  // params-Promise uitpakken ✅
  const { lang: rawLang, id } = await props.params;

  const lang: Locale = isLocale(rawLang) ? rawLang : "en";
  const t = translations[lang];

  const s = await supabaseServer();

  const { data: biz, error } = await s
    .from("public_businesses")
    .select("*")
    .eq("id", id)
    .maybeSingle<BusinessRow>();

  console.log("[biz page] result:", { error, biz });

  if (error || !biz) {
    console.error("[biz page] Supabase error or no data:", { error, biz });
    return notFound();
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="mx-auto max-w-4xl">
        {/* HEADER */}
        <header className="mb-8">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            {biz.category_name ?? t.businesses ?? "Business"}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            {biz.business_name}
          </h1>
          {biz.island && (
            <p className="mt-2 text-muted-foreground">
              {biz.island.charAt(0).toUpperCase() + biz.island.slice(1)}
            </p>
          )}
        </header>

        {/* COVER FOTO */}
        {biz.cover_image_url && (
          <div className="mb-8 overflow-hidden rounded-xl border bg-muted">
            <img
              src={biz.cover_image_url}
              alt={biz.business_name}
              className="h-64 w-full object-cover"
            />
          </div>
        )}

        {/* GRID LAYOUT */}
        <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
          {/* CONTENT */}
          <section className="space-y-4">
            {biz.description && (
              <p className="text-lg leading-relaxed whitespace-pre-line">
                {biz.description}
              </p>
            )}
          </section>

          {/* CONTACT SIDEBAR */}
          <aside className="space-y-4 rounded-xl border bg-card p-4 text-sm">
            <h2 className="text-base font-semibold">
              {t.contact ?? "Contact"}
            </h2>

            {biz.address && <p>{biz.address}</p>}

            <div className="space-y-1">
              {biz.phone && (
                <p>
                  <span className="font-medium">Tel:</span>{" "}
                  <a href={`tel:${biz.phone}`} className="underline">
                    {biz.phone}
                  </a>
                </p>
              )}

              {biz.whatsapp && (
                <p>
                  <span className="font-medium">WhatsApp:</span>{" "}
                  <a
                    href={`https://wa.me/${biz.whatsapp}`}
                    target="_blank"
                    className="underline"
                  >
                    {biz.whatsapp}
                  </a>
                </p>
              )}

              {biz.email && (
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  <a
                    href={`mailto:${biz.email}`}
                    className="underline break-all"
                  >
                    {biz.email}
                  </a>
                </p>
              )}

              {biz.website && (
                <p>
                  <span className="font-medium">Website:</span>{" "}
                  <a
                    href={biz.website}
                    target="_blank"
                    className="underline break-all"
                  >
                    {biz.website}
                  </a>
                </p>
              )}
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}