// app/[lang]/godmode/page.tsx
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";

type PageParams = { lang: Locale };
type PageProps = { params: Promise<PageParams> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "en";

  return {
    title:
      lang === "nl"
        ? "God Mode Dashboard | Guide Me ABC"
        : "God Mode Dashboard | Guide Me ABC",
    description:
      lang === "nl"
        ? "Volledige controle over Guide Me ABC als super_admin."
        : "Full control over Guide Me ABC as super_admin.",
  };
}

export default async function GodmodePage({ params }: PageProps) {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "en";

  const isNl = lang === "nl";

  return (
    <main className="container mx-auto max-w-6xl px-4 pt-24 pb-16">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">
        {isNl ? "God Mode Dashboard" : "God Mode Dashboard"}
      </h1>

      <p className="text-muted-foreground mb-8 max-w-2xl">
        {isNl
          ? "Je bent ingelogd als super_admin. Vanaf hier beheer je het volledige platform: bedrijven, gebruikers, reviews en instellingen."
          : "You are logged in as super_admin. From here you control the entire platform: businesses, users, reviews and settings."}
      </p>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <GodmodeTile
          href={`/${lang}/admin/businesses`}
          title={isNl ? "Alle bedrijven" : "All businesses"}
          description={
            isNl
              ? "Beheer bedrijfsvermeldingen, pending aanvragen en abonnementen."
              : "Manage business listings, pending requests and subscriptions."
          }
        />
        <GodmodeTile
          href={`/${lang}/godmode/users`}
          title={isNl ? "Gebruikers & rollen" : "Users & roles"}
          description={
            isNl
              ? "Bekijk accounts, rollen en status. Later: rolbeheer vanuit de UI."
              : "View accounts, their roles and status. Later: role management from the UI."
          }
        />
        <GodmodeTile
          href={`/${lang}/godmode/reviews`}
          title={isNl ? "Reviews & meldingen" : "Reviews & reports"}
          description={
            isNl
              ? "Modereren van reviews en meldingen van misbruik."
              : "Moderate reviews and handle abuse reports."
          }
        />
        <GodmodeTile
          href={`/${lang}/godmode/content`}
          title={isNl ? "Eiland-content" : "Island content"}
          description={
            isNl
              ? "Beheer uitgelichte plekken, categorieën en redactionele content."
              : "Manage featured spots, categories and editorial content."
          }
        />
        <GodmodeTile
          href={`/${lang}/godmode/ai`}
          title={isNl ? "AI & premium" : "AI & premium"}
          description={
            isNl
              ? "Instellingen voor AI-concierge, limieten en premium features."
              : "Settings for the AI concierge, limits and premium features."
          }
        />
        <GodmodeTile
          href={`/${lang}/account`}
          title={isNl ? "Terug naar mijn account" : "Back to my account"}
          description={
            isNl
              ? "Naar je persoonlijke account- en profielpagina."
              : "Go to your personal account and profile page."
          }
        />
      </div>
    </main>
  );
}

function GodmodeTile(props: { href: string; title: string; description: string }) {
  return (
    <a
      href={props.href}
      className="block rounded-2xl border border-border bg-card/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <h2 className="font-semibold text-lg mb-1">{props.title}</h2>
      <p className="text-sm text-muted-foreground">{props.description}</p>
    </a>
  );
}