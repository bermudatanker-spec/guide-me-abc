// app/[lang]/godmode/logs/page.tsx
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

type Params = { lang: Locale };
type Props = { params: Promise<Params> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "en";
  const isNl = lang === "nl";

  return {
    title: isNl ? "Activiteit & logs | God Mode" : "Activity & logs | God Mode",
    description: isNl
      ? "Overzicht van belangrijke acties en systeemlogs."
      : "Overview of important actions and system logs.",
  };
}

export default async function GodmodeLogsPage({ params }: Props) {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "en";
  const isNl = lang === "nl";

  return (
    <main className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
          God Mode · Logs
        </p>
        <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight">
          {isNl ? "Activiteit & logs" : "Activity & logs"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm sm:text-base text-muted-foreground">
          {isNl
            ? "Hier komt een overzicht van belangrijke acties, moderatiebeslissingen en (optioneel) foutmeldingen."
            : "Here we will show an overview of important actions, moderation decisions and (optionally) error events."}
        </p>
      </header>

      <Card className="border-dashed border-primary/20">
        <CardHeader>
          <CardTitle>
            {isNl ? "In aanbouw" : "Work in progress"}
          </CardTitle>
          <CardDescription>
            {isNl
              ? "We kunnen hier later een logs-tabel in Supabase op aansluiten (bijvoorbeeld admin_actions, auth_events, review_logs)."
              : "Later we can connect this to a logs table in Supabase (for example admin_actions, auth_events, review_logs)."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>
              {isNl
                ? "God Mode-acties (rollen wijzigen, bedrijven overrulen)."
                : "God Mode actions (changing roles, overruling businesses)."}
            </li>
            <li>
              {isNl
                ? "Moderatie van bedrijven en reviews."
                : "Moderation events for businesses and reviews."}
            </li>
            <li>
              {isNl
                ? "Belangrijke foutmeldingen of mislukte acties."
                : "Important error events or failed actions."}
            </li>
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}