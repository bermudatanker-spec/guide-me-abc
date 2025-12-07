// app/[lang]/maintenance/page.tsx
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";

type Params = { lang: Locale };

export function generateMetadata({ params }: { params: Params }): Metadata {
  const lang = isLocale(params.lang) ? params.lang : "en";
  const isNl = lang === "nl";

  return {
    title: isNl ? "Onderhoud" : "Maintenance",
    description: isNl
      ? "Guide Me ABC is tijdelijk niet beschikbaar."
      : "Guide Me ABC is temporarily unavailable.",
  };
}

export default function MaintenancePage({ params }: { params: Params }) {
  const lang = isLocale(params.lang) ? params.lang : "en";
  const isNl = lang === "nl";

  return (
    <main className="min-h-dvh flex items-center justify-center bg-background px-6">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-3xl font-semibold">
          {isNl ? "We zijn even offline" : "We’ll be right back"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isNl
            ? "Guide Me ABC wordt op dit moment onderhouden. We zijn snel weer terug."
            : "Guide Me ABC is currently undergoing maintenance. We’ll be back soon."}
        </p>
      </div>
    </main>
  );
}