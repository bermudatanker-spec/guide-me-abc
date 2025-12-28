// src/app/[lang]/maintenance/page.tsx
import type { Metadata } from "next";
import { isLocale, type Locale, LOCALES } from "@/i18n/config";
import { buildLanguageAlternates } from "@/lib/seo/alternates";

type PageProps = {
  params: Promise<{ lang: string }>;
};

const SITE_URL = "https://guide-me-abc.com";
const BASE_PATH = "/maintenance";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "en";
  const isNl = lang === "nl";

  const title = isNl ? "Onderhoud | Guide Me ABC" : "Maintenance | Guide Me ABC";
  const description = isNl
    ? "Guide Me ABC is tijdelijk niet beschikbaar vanwege onderhoud."
    : "Guide Me ABC is temporarily unavailable due to maintenance.";

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: `/${lang}${BASE_PATH}`,
      languages: buildLanguageAlternates(LOCALES, BASE_PATH),
    },
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        "max-snippet": -1,
        "max-image-preview": "none",
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title,
      description,
      // OpenGraph URLs should be absolute
      url: new URL(`/${lang}${BASE_PATH}`, SITE_URL).toString(),
      type: "website",
    },
  };
}

export default async function MaintenancePage({ params }: PageProps) {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "en";
  const isNl = lang === "nl";

  return (
    <main className="min-h-dvh flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center space-y-4">
        <div className="mx-auto inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
          {isNl ? "Onderhoud" : "Maintenance"}
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {isNl ? "We zijn even offline" : "We’ll be right back"}
        </h1>

        <p className="text-muted-foreground text-sm leading-relaxed">
          {isNl
            ? "Guide Me ABC wordt op dit moment onderhouden. We zijn snel weer terug."
            : "Guide Me ABC is currently undergoing maintenance. We’ll be back soon."}
        </p>

        <p className="text-xs text-muted-foreground">
          {isNl ? "Bedankt voor je geduld." : "Thanks for your patience."}
        </p>
      </div>
    </main>
  );
}