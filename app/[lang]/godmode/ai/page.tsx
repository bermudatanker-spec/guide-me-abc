// app/[lang]/godmode/ai/page.tsx
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

type Params = { lang: Locale };
type Props = { params: Promise<Params> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "en";
  const isNl = lang === "nl";

  return {
    title: isNl ? "AI & Travel Assistant | God Mode" : "AI & Travel Assistant | God Mode",
    description: isNl
      ? "Beheer AI-gedrag, premium vragen en toegang."
      : "Manage AI behaviour, premium questions and access.",
  };
}

export default async function GodmodeAiPage({ params }: Props) {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "en";
  const isNl = lang === "nl";

  return (
    <main className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
          God Mode · AI
        </p>
        <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight">
          {isNl ? "AI & Travel Assistant" : "AI & Travel Assistant"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm sm:text-base text-muted-foreground">
          {isNl
            ? "Configureer straks hoe de AI vragen van toeristen en locals beantwoordt, en wat premium gebruikers extra mogen vragen."
            : "Configure how the AI answers tourist and local questions, and which extras premium users get."}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{isNl ? "Toegang & premium" : "Access & premium"}</CardTitle>
          <CardDescription>
            {isNl
              ? "Bepaal welke features gratis zijn en welke alleen voor premium accounts gelden."
              : "Decide which features are free and which are reserved for premium accounts."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="font-medium">
                {isNl ? "AI voor ingelogde gebruikers" : "AI for logged-in users"}
              </Label>
              <p className="text-xs text-muted-foreground">
                {isNl
                  ? "Als dit uit staat, kan alleen God Mode / Admin de AI gebruiken."
                  : "If disabled, only God Mode / Admin can use the AI tools."}
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="font-medium">
                {isNl ? "Premium-only vragen" : "Premium-only questions"}
              </Label>
              <p className="text-xs text-muted-foreground">
                {isNl
                  ? "Bijvoorbeeld: gepersonaliseerde dagplanning, verborgen parels, realtime tips."
                  : "For example: custom day planning, hidden gems, realtime tailored tips."}
              </p>
            </div>
            <Switch />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="font-medium">
                  {isNl ? "Creativiteit van AI" : "AI creativity"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {isNl
                    ? "Lager = feitelijk en kort. Hoger = creatiever en vrijer."
                    : "Lower = factual and short. Higher = more creative and free."}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">beta</span>
            </div>
            <Slider defaultValue={[60]} max={100} step={10} />
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            {isNl
              ? "Deze instellingen zijn nu nog lokaal (frontend-only). Later koppelen we dit aan Supabase zodat je God Mode-aanpassingen permanent zijn."
              : "These settings are currently local (frontend-only). Later we'll bind them to Supabase so your God Mode changes are permanent."}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}