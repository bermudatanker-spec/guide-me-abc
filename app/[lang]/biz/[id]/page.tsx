// app/[lang]/biz/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ResponsiveImage from "@/components/ResponsiveImage";
import { isLocale, type Locale } from "@/i18n/config";
import { DICTS } from "@/i18n/dictionaries";
import { supabaseServer } from "@/lib/supabase/server";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Star,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */

type Params = { lang: Locale; id: string };

type Maybe<T> = T | null | undefined;

type BusinessRow = {
  id: string;
  business_name: string;
  description: string | null;
  island: "aruba" | "bonaire" | "curacao";

  logo_url: string | null;
  cover_image_url: string | null;

  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  whatsapp: string | null;

  subscription_plan: string | null;
  status: string | null;

  rating_avg: number | null;
  rating_count: number | null;

  category_name?: string | null;
  category_slug?: string | null;
};

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

const dict = (l: Locale) => DICTS[l] ?? DICTS.en;

function islandLabel(i?: string) {
  if (i === "aruba") return "Aruba";
  if (i === "bonaire") return "Bonaire";
  if (i === "curacao") return "Curaçao";
  return "";
}

const telHref = (v: Maybe<string>) =>
  v ? `tel:${v.replace(/[^\d+]/g, "")}` : undefined;

const waHref = (v: Maybe<string>, text?: string) =>
  v
    ? `https://wa.me/${v.replace(/\D/g, "")}${
        text ? `?text=${encodeURIComponent(text)}` : ""
      }`
    : undefined;

/* ------------------------------------------------------------------ */
/* Metadata (Next 16 – params is een Promise) */
/* ------------------------------------------------------------------ */

export async function generateMetadata(
  props: { params: Promise<Params> }
): Promise<Metadata> {
  const { params } = await props; // ⬅ heel belangrijk!
  const lang = isLocale(params.lang) ? params.lang : "en";
  const s = await supabaseServer();

  const { data } = await s
    .from("public_businesses")
    .select("business_name, description")
    .eq("id", params.id)
    .maybeSingle<Pick<BusinessRow, "business_name" | "description">>();

  const t = dict(lang);

  const title = data?.business_name
    ? `${data.business_name} | Guide Me ABC`
    : (t?.business ?? "Business") + " | Guide Me ABC";

  const description =
    data?.description ??
    "Discover trusted local businesses on the ABC Islands.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/biz/${params.id}`,
      languages: {
        en: `/en/biz/${params.id}`,
        nl: `/nl/biz/${params.id}`,
        pap: `/pap/biz/${params.id}`,
        es: `/es/biz/${params.id}`,
      } as Record<string, string>,
    },
    openGraph: { title, description, url: `/${lang}/biz/${params.id}` },
  };
}

/* ------------------------------------------------------------------ */
/* Page (server component) */
/* ------------------------------------------------------------------ */

export const dynamic = "force-dynamic";

export default async function BizDetailPage(
  props: { params: Promise<Params> }
) {
  const { params } = await props; // ⬅ hier óók de Promise eerst awaiten
  const lang = isLocale(params.lang) ? params.lang : "en";

  const s = await supabaseServer();
  await s.auth.getUser(); // optioneel

  const { data: biz, error } = await s
    .from("public_businesses")
    .select(
      [
        "id",
        "business_name",
        "description",
        "island",
        "logo_url",
        "cover_image_url",
        "address",
        "phone",
        "email",
        "website",
        "whatsapp",
        "subscription_plan",
        "status",
        "rating_avg",
        "rating_count",
        "category_name",
        "category_slug",
      ].join(",")
    )
    .eq("id", params.id)
    .maybeSingle<BusinessRow>();

  if (error || !biz) {
    console.error("[biz page] Supabase error or no data:", { error, biz });
    notFound();
  }

  const plan = (biz.subscription_plan ?? "").toLowerCase();
  const status = (biz.status ?? "").toLowerCase();

  if (plan !== "pro" || status !== "active") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full rounded-xl border border-border bg-card shadow-sm">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              {lang === "nl" ? "Niet beschikbaar" : "Not available"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {lang === "nl"
                ? "Deze mini-website is alleen beschikbaar voor Pro-pakket bedrijven."
                : "This mini site is only available for Pro plan businesses."}
            </p>
            <Link
              href={`/${lang}/businesses`}
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm text-white transition"
              style={{
                background:
                  "linear-gradient(90deg, #00BFD3 0%, rgba(0,191,211,0.1) 100%)",
                boxShadow:
                  "0 4px 12px rgba(0,191,211,0.5), 0 0 18px rgba(0,191,211,0.35)",
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {lang === "nl" ? "Terug naar overzicht" : "Back to list"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hero = biz.cover_image_url || "/images/business-hero-fallback.jpg";

  const ratingText =
    biz.rating_avg && biz.rating_count
      ? `${biz.rating_avg.toFixed(1)} (${biz.rating_count})`
      : undefined;

  const tel = telHref(biz.phone);
  const wa = waHref(biz.whatsapp, `Hi ${biz.business_name}!`);

  return (
    <div className="min-h-screen bg-background">
      {/* Back link */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <Link
          href={`/${lang}/businesses`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {lang === "nl" ? "Terug naar overzicht" : "Back to list"}
        </Link>
      </div>

      {/* Hero */}
      <section className="relative mt-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-border">
            <div className="relative h-[280px] md:h-[360px]">
              <ResponsiveImage
                src={hero}
                alt={biz.business_name}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute left-5 right-5 bottom-5 text-white">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge className="bg-white/15 text-white backdrop-blur-md">
                    {islandLabel(biz.island)}
                  </Badge>

                  {biz.category_name && <Badge>{biz.category_name}</Badge>}

                  {ratingText && (
                    <span className="inline-flex items-center gap-1 text-sm opacity-95">
                      <Star className="h-4 w-4 fill-current" />
                      {ratingText}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold drop-shadow">
                  {biz.business_name}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Acties */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex flex-wrap gap-3">
          {biz.website && (
            <Button asChild variant="hero" size="lg">
              <a href={biz.website} target="_blank" rel="noopener noreferrer">
                {lang === "nl" ? "Bezoek Website" : "Visit Website"}
                <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          )}

          {wa && (
            <Button
              asChild
              size="lg"
              className="text-white"
              style={{
                background:
                  "linear-gradient(90deg, #00BFD3 0%, rgba(0,191,211,0.1) 100%)",
                boxShadow:
                  "0 4px 12px rgba(0,191,211,0.5), 0 0 18px rgba(0,191,211,0.35)",
              }}
            >
              <a href={wa} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" />
                WhatsApp
              </a>
            </Button>
          )}

          {biz.email && (
            <Button
              asChild
              size="lg"
              className="text-white"
              style={{
                background:
                  "linear-gradient(90deg, #FF7A4F 0%, #FF946C 100%)",
                boxShadow: "0 2px 6px rgba(255,122,79,0.18)",
              }}
            >
              <a href={`mailto:${biz.email}`}>
                <Mail className="mr-2 h-5 w-5" />
                Email
              </a>
            </Button>
          )}

          {tel && (
            <Button asChild variant="outline" size="lg">
              <a href={tel}>
                <Phone className="mr-2 h-5 w-5" />
                {lang === "nl" ? "Bellen" : "Call"}
              </a>
            </Button>
          )}
        </div>
      </section>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-3">
                  {lang === "nl" ? "Over" : "About"}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {biz.description ??
                    (lang === "nl"
                      ? "Beschrijving volgt binnenkort."
                      : "Description coming soon.")}
                </p>
              </CardContent>
            </Card>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">
                    {lang === "nl" ? "Reviews" : "Reviews"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {lang === "nl"
                      ? "Reviews worden later getoond."
                      : "Reviews will appear later."}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">
                    {lang === "nl" ? "Galerij" : "Gallery"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {lang === "nl"
                      ? "Galerij wordt later toegevoegd."
                      : "Gallery will be added later."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right */}
          <aside className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-3 text-sm">
                {biz.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <span className="text-foreground/90">{biz.address}</span>
                  </div>
                )}
                {biz.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={biz.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {biz.website}
                    </a>
                  </div>
                )}
                {biz.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${biz.email}`}
                      className="text-primary hover:underline break-all"
                    >
                      {biz.email}
                    </a>
                  </div>
                )}
                {biz.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={tel ?? "#"}
                      className="text-primary hover:underline"
                    >
                      {biz.phone}
                    </a>
                  </div>
                )}
                {biz.whatsapp && (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={wa ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      WhatsApp
                    </a>
                  </div>
                )}
                {biz.subscription_plan && (
                  <div className="pt-2">
                    <Badge variant="outline">
                      Plan: {biz.subscription_plan}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <div className="h-48 w-full rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-sm">
                  {lang === "nl"
                    ? "Kaart volgt (adres)"
                    : "Map placeholder (address)"}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: biz.business_name,
            address: biz.address ?? undefined,
            url: biz.website ?? undefined,
            email: biz.email ?? undefined,
            telephone: biz.phone ?? undefined,
            image: biz.logo_url ?? biz.cover_image_url ?? undefined,
            aggregateRating:
              biz.rating_avg && biz.rating_count
                ? {
                    "@type": "AggregateRating",
                    ratingValue: biz.rating_avg,
                    reviewCount: biz.rating_count,
                  }
                : undefined,
            areaServed: islandLabel(biz.island),
          }),
        }}
      />
    </div>
  );
}