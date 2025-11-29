// app/[lang]/biz/[id]/page.tsx

import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import { isLocale, type Locale } from "@/i18n/config";

/* ------------------------ Types ------------------------ */

type PageProps = {
  // jouw Promise-workaround mag zo blijven
  params: Promise<{ lang: string; id: string }>;
};

type OfferRow = {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  valid_until: string | null;
  image_url: string | null;
};

type BizRow = {
  id: string;
  business_name: string;
  island: "aruba" | "bonaire" | "curacao" | string;
  category_name: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  opening_hours: string | null;
  temporarily_closed: boolean | null;
  offers: OfferRow[] | null;
};

/* ------------------------ Teksten per taal ------------------------ */

const TEXTS: Record<Locale, Record<string, string>> = {
  en: {
    opening_hours: "Opening hours",
    opening_hours_missing: "Opening hours not filled in yet",
    closed_temporarily: "Temporarily closed",
    closed_temporarily_long:
      "This business is currently temporarily closed.",
    contact: "Contact",
    aruba: "Aruba",
    bonaire: "Bonaire",
    curacao: "Curaçao",
    call: "Call",
    route: "Route",
    whatsapp: "WhatsApp",
    offers: "Special offers",
    no_offers: "No current offers.",
    valid_until_prefix: "Valid until",
  },
  nl: {
    opening_hours: "Openingstijden",
    opening_hours_missing: "Openingstijden nog niet ingevuld.",
    closed_temporarily: "Tijdelijk gesloten",
    closed_temporarily_long:
      "Dit bedrijf is op dit moment tijdelijk gesloten.",
    contact: "Contact",
    aruba: "Aruba",
    bonaire: "Bonaire",
    curacao: "Curaçao",
    call: "Bel",
    route: "Route",
    whatsapp: "WhatsApp",
    offers: "Aanbiedingen",
    no_offers: "Geen actuele aanbiedingen.",
    valid_until_prefix: "Geldig t/m",
  },
  es: {
    opening_hours: "Horario",
    opening_hours_missing: "El horario aún no se ha rellenado.",
    closed_temporarily: "Cerrado temporalmente",
    closed_temporarily_long:
      "Este negocio está cerrado temporalmente en este momento.",
    contact: "Contacto",
    aruba: "Aruba",
    bonaire: "Bonaire",
    curacao: "Curazao",
    call: "Llamar",
    route: "Ruta",
    whatsapp: "WhatsApp",
    offers: "Ofertas",
    no_offers: "No hay ofertas activas.",
    valid_until_prefix: "Válido hasta",
  },
  pap: {
    opening_hours: "Ora di habri",
    opening_hours_missing: "Ora di habri noa wordu yená ahinda.",
    closed_temporarily: "Temporalmente será",
    closed_temporarily_long:
      "E negoshi aki ta keda temporalmente será awor aki.",
    contact: "Kontakt",
    aruba: "Aruba",
    bonaire: "Boneiru",
    curacao: "Kòrsou",
    call: "Yama",
    route: "Ruta",
    whatsapp: "WhatsApp",
    offers: "Oferta speshal",
    no_offers: "No tin oferta aktuál.",
    valid_until_prefix: "Válido te",
  },
};

/* ------------------------ Island theme ------------------------ */

const ISLAND_THEME: Record<
  "aruba" | "bonaire" | "curacao" | "default",
  { bg: string; badgeBg: string; badgeText: string; pill: string }
> = {
  aruba: {
    bg: "bg-gradient-to-br from-[#0095DA] via-[#00C4B3] to-[#FCE45C]",
    badgeBg: "bg-white/10 border-white/25",
    badgeText: "text-slate-50",
    pill: "bg-yellow-300 text-slate-900",
  },
  bonaire: {
    bg: "bg-gradient-to-br from-[#002B7F] via-[#FFC61E] to-[#CE1126]",
    badgeBg: "bg-white/12 border-white/25",
    badgeText: "text-slate-50",
    pill: "bg-amber-400 text-slate-900",
  },
  curacao: {
    bg: "bg-gradient-to-br from-[#002868] via-[#0038A8] to-[#001845]",
    badgeBg: "bg-white/12 border-white/25",
    badgeText: "text-indigo-50",
    pill: "bg-yellow-400 text-slate-900",
  },
  default: {
    bg: "bg-gradient-to-br from-sky-700 via-cyan-600 to-sky-900",
    badgeBg: "bg-white/15 border-white/30",
    badgeText: "text-slate-50",
    pill: "bg-white text-slate-900",
  },
};

/* ------------------------ Opening hours helper ------------------------ */

type OpeningLine = {
  day: string;
  closed: boolean;
  from: string; // "09:00"
  to: string;   // "18:00"
};

// simpele parser: elke regel "Maandag: 09:00 - 18:00" of "Zondag: Gesloten"
function splitOpeningHours(raw: string, lang: Locale): OpeningLine[] {
  if (!raw || !raw.trim()) return [];

  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);

  return lines.map<OpeningLine>((line) => {
    // dag + rest
    const [dayPart, restPartRaw] = line.split(":");
    const day = (dayPart ?? "").trim() || "?";
    const restPart = (restPartRaw ?? "").trim();

    // woorden voor "gesloten" in verschillende talen
    const closedWords = ["gesloten", "closed", "cerrado", "será"];
    const isClosed = closedWords.some((w) =>
      restPart.toLowerCase().includes(w)
    );

    if (isClosed) {
      return {
        day,
        closed: true,
        from: "",
        to: "",
      };
    }

    // probeer "09:00 - 18:00" te parsen
    const match = restPart.match(/(\d{1,2}:\d{2}).*?(\d{1,2}:\d{2})/);
    if (!match) {
      // fallback: geen tijden gevonden, laat dag zien zonder tijden
      return {
        day,
        closed: false,
        from: "",
        to: "",
      };
    }

    return {
      day,
      closed: false,
      from: match[1],
      to: match[2],
    };
  });
}

/* ------------------------ Metadata (SEO) ------------------------ */

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata | null> {
  const { id } = await params;
  const supabase = await supabaseServer();

  const { data: biz } = await supabase
    .from("business_listings")
    .select("business_name, description")
    .eq("id", id)
    .eq("status", "active")
    .eq("subscription_plan", "pro")
    .maybeSingle<Pick<BizRow, "business_name" | "description">>();

  if (!biz) return null;

  return {
    title: biz.business_name,
    description: biz.description ?? "",
  };
}

/* ------------------------ Pagina ------------------------ */

export default async function BizDetailPage({ params }: PageProps) {
  const { lang, id } = await params;
  const locale: Locale = isLocale(lang) ? (lang as Locale) : "en";
  const t = TEXTS[locale];

  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("business_listings")
    .select(
      `
      id,
      business_name,
      island,
      description,
      address,
      phone,
      whatsapp,
      email,
      website,
      opening_hours,
      temporarily_closed,
      category_name:category_id ( name ),
      offers:business_offers (
        id,
        title,
        description,
        price,
        valid_until,
        image_url
      )
    `
    )
    .eq("id", id)
    .eq("status", "active")
    .eq("subscription_plan", "pro")
    .maybeSingle<{
      id: string;
      business_name: string;
      island: string;
      description: string | null;
      address: string | null;
      phone: string | null;
      whatsapp: string | null;
      email: string | null;
      website: string | null;
      opening_hours: string | null;
      temporarily_closed: boolean | null;
      category_name: { name: string } | null;
      offers: OfferRow[] | null;
    }>();

  // 1) echte Supabase-fout → 404
  if (error) {
    console.error("[biz page] Supabase error", error);
    notFound();
  }

  // 2) geen data = geen PRO + ACTIVE listing → terug naar dashboard
  if (!data) {
    return redirect(`/${locale}/business/dashboard?mini=locked`);
  }

  const biz: BizRow = {
    id: data.id,
    business_name: data.business_name,
    island: data.island,
    category_name: data.category_name?.name ?? null,
    description: data.description,
    address: data.address,
    phone: data.phone,
    whatsapp: data.whatsapp,
    email: data.email,
    website: data.website,
    opening_hours: data.opening_hours,
    temporarily_closed: data.temporarily_closed,
    offers: data.offers ?? [],
  };

  const openingLines =
  splitOpeningHours(biz.opening_hours??"", locale);

  const islandKey =
    biz.island === "aruba" ||
    biz.island === "bonaire" ||
    biz.island === "curacao"
      ? biz.island
      : "default";

  const theme = ISLAND_THEME[islandKey];

  const islandLabel =
    islandKey === "aruba"
      ? t.aruba
      : islandKey === "bonaire"
      ? t.bonaire
      : islandKey === "curacao"
      ? t.curacao
      : biz.island;

  const hasOffers = biz.offers && biz.offers.length > 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HERO */}
      <section className={`pb-10 pt-24 ${theme.bg} relative overflow-hidden`}>
        <div className="hero-haze pointer-events-none absolute inset-0" />

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          {/* breadcrumb + pill */}
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium">
            <span className="rounded-full bg-black/20 px-3 py-1">
              {islandLabel}
            </span>
            {biz.category_name && (
              <>
                <span className="opacity-60">•</span>
                <span className="rounded-full bg-black/20 px-3 py-1">
                  {biz.category_name}
                </span>
              </>
            )}

            <div
              className={`ml-auto inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-wide ${theme.badgeBg} ${theme.badgeText}`}
            >
              <span>PRO</span>
              <span
                className={
                  theme.pill + " rounded-full px-3 py-0.5 text-[11px]"
                }
              >
                MINI-SITE
              </span>
            </div>
          </div>

          {/* title + short description */}
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-title-gradient text-shadow-hero">
              {biz.business_name}
            </h1>
            {biz.description && (
              <p className="max-w-xl text-sm sm:text-base text-white/90">
                {biz.description}
              </p>
            )}
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-3">
            {biz.address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  biz.address
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full bg-ocean-btn px-5 py-2.5 text-sm font-semibold text-white shadow-glow hover:opacity-95"
              >
                {t.route}
              </a>
            )}
            {biz.phone && (
              <a
                href={`tel:${biz.phone}`}
                className="inline-flex items-center rounded-full bg-white/90 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-card hover:bg-white"
              >
                {t.call}: {biz.phone}
              </a>
            )}
            {biz.whatsapp && (
              <a
                href={`https://wa.me/${biz.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full bg-coral-btn px-5 py-2.5 text-sm font-semibold text-white shadow-glow hover:opacity-95"
              >
                {t.whatsapp}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="bg-slate-950 pb-20 pt-8">
        <div className="container mx-auto grid gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] lg:px-8">
          {/* LEFT: about / hours / offers */}
          <div className="space-y-6">
            {/* Over */}
            <div className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-card">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/70">
                Over
              </h2>
              <p className="text-sm leading-relaxed text-white/90">
                {biz.description ??
                  "Er is nog geen uitgebreide beschrijving toegevoegd voor dit bedrijf."}
              </p>
            </div>

           {/* Openingstijden */}
<div className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-card">
  <div className="mb-2 flex items-center justify_between">
    <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70">
      {t.opening_hours}
    </h2>
    {biz.temporarily_closed && (
      <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-100">
        {t.closed_temporarily}
      </span>
    )}
  </div>

  {biz.temporarily_closed && (
    <p className="mb-3 text-xs text-red-100/80">
      {t.closed_temporarily_long}
    </p>
  )}

  {openingLines.length === 0 ? (
    <p className="text-sm text-white/70">
      Openingstijden nog niet ingevuld.
    </p>
  ) : (
    <ul className="space-y-1 text-sm text-white/90">
      {openingLines.map((line, i) => (
        <li key={i} className="flex items-center justify-between">
          <span className="w-32 text-white/80 font-medium">
            {line.day}
          </span>

          {line.closed ? (
            <span className="text-red-300 text-sm flex items-center gap-1">
              {/* klein icoontje */}
              <svg width="14" height="14" fill="currentColor">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
                <line x1="4" y1="4" x2="10" y2="10" stroke="currentColor" strokeWidth="2" />
              </svg>
              {t.closed_temporarily}
            </span>
          ) : (
            <span className="text-green-300 text-sm flex items-center gap-1">
              <svg width="14" height="14" fill="currentColor">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="7" cy="7" r="3" />
              </svg>
              {line.from} – {line.to}
            </span>
          )}
        </li>
      ))}
    </ul>
  )}
</div>

            {/* Aanbiedingen */}
            <div className="rounded-2xl border border-white/5 bg-white/5 p-6 shadow-card">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">
                {t.offers}
              </h2>

              {!hasOffers && (
                <p className="text-sm text-white/80">{t.no_offers}</p>
              )}

              {hasOffers && (
                <div className="space-y-3">
                  {biz.offers!.map((offer) => (
                    <div
                      key={offer.id}
                      className="rounded-xl border border-white/10 bg-slate-900/40 p-4"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-sm font-semibold text-white">
                          {offer.title}
                        </h3>
                        {offer.price && (
                          <span className="rounded-full bg-emerald-400/90 px-3 py-0.5 text-xs font-semibold text-emerald-950">
                            {offer.price}
                          </span>
                        )}
                      </div>

                      {offer.description && (
                        <p className="mt-1 text-xs text-white/80 whitespace-pre-line">
                          {offer.description}
                        </p>
                      )}

                      {offer.valid_until && (
                        <p className="mt-2 text-[11px] text-white/60">
                          {t.valid_until_prefix}{" "}
                          {new Date(
                            offer.valid_until
                          ).toLocaleDateString(lang, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: contact card */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 shadow-card">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">
                {t.contact}
              </h2>

              <div className="space-y-3 text-sm text-white/90">
                {biz.address && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-white/60">
                      Adres
                    </div>
                    <div>{biz.address}</div>
                  </div>
                )}
                {biz.phone && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-white/60">
                      Telefoon
                    </div>
                    <a
                      href={`tel:${biz.phone}`}
                      className="underline-offset-2 hover:underline"
                    >
                      {biz.phone}
                    </a>
                  </div>
                )}
                {biz.whatsapp && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-white/60">
                      WhatsApp
                    </div>
                    <a
                      href={`https://wa.me/${biz.whatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline-offset-2 hover:underline"
                    >
                      {biz.whatsapp}
                    </a>
                  </div>
                )}
                {biz.email && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-white/60">
                      E-mail
                    </div>
                    <a
                      href={`mailto:${biz.email}`}
                      className="underline-offset-2 hover:underline"
                    >
                      {biz.email}
                    </a>
                  </div>
                )}
                {biz.website && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-white/60">
                      Website
                    </div>
                    <a
                      href={biz.website}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all underline-offset-2 hover:underline"
                    >
                      {biz.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}