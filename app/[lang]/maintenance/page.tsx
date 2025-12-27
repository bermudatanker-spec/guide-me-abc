import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";

// ✅ Next 16 type definitie: params is een Promise
type PageProps = {
  params: Promise<{ lang: string }>;
};

/* -------------------- Metadata (Next 16 Fix) -------------------- */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params; // ✅ Verplichte await
  const lang = isLocale(resolvedParams.lang) ? (resolvedParams.lang as Locale) : "en";
  const isNl = lang === "nl";

  return {
    title: isNl ? "Onderhoud" : "Maintenance",
    description: isNl
      ? "Guide Me ABC is tijdelijk niet beschikbaar."
      : "Guide Me ABC is temporarily unavailable.",
  };
}

/* -------------------- Page Component (Next 16 Fix) -------------------- */
export default async function MaintenancePage({ params }: PageProps) {
  const resolvedParams = await params; // ✅ Verplichte await
  const lang = isLocale(resolvedParams.lang) ? (resolvedParams.lang as Locale) : "en";
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