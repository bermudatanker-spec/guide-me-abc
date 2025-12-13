// app/[lang]/godmode/settings/ui/SettingsClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

/* ───────────────── Types ───────────────── */

type Props = {
  lang: Locale;
};

type SettingKey =
  | "maintenance_mode"
  | "allow_registrations"
  | "auto_approve_businesses"
  | "auto_approve_reviews"
  | "force_email_verification"
  | "ai_max_free"
  | "ai_max_premium"
  | "ai_temperature"
  | "featured_per_island"
  | "auto_sort_popular"
  | "auto_block_suspicious"
  | "rate_limit_level";

type BooleanKey =
  | "maintenance_mode"
  | "allow_registrations"
  | "auto_approve_businesses"
  | "auto_approve_reviews"
  | "force_email_verification"
  | "auto_sort_popular"
  | "auto_block_suspicious";

type NumberKey = Exclude<SettingKey, BooleanKey>;

type SettingsState = {
  [K in BooleanKey]: boolean;
} & {
  [K in NumberKey]: number;
};

type Row = {
  key: string;
  value: unknown;
};

/* ───────────────── Defaults ───────────────── */

const DEFAULT_SETTINGS: SettingsState = {
  maintenance_mode: false,
  allow_registrations: true,
  auto_approve_businesses: false,
  auto_approve_reviews: false,
  force_email_verification: true,

  ai_max_free: 10,
  ai_max_premium: 50,
  ai_temperature: 0.5,

  featured_per_island: 6,
  auto_sort_popular: true,
  auto_block_suspicious: true,
  rate_limit_level: 2,
};

/* ───────────────── Component ───────────────── */

export default function SettingsClient({ lang }: Props) {
  const isNl = lang === "nl";
  const supabase = useMemo(() => supabaseBrowser(), []);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [dirty, setDirty] = useState(false);

  /* ───────── Helpers ───────── */

  function normalize(rows: Row[]): SettingsState {
    const base: SettingsState = { ...DEFAULT_SETTINGS };

    for (const row of rows) {
      const key = row.key as SettingKey;
      if (!(key in base)) continue;

      const defaultValue = DEFAULT_SETTINGS[key];

      // Boolean settings
      if (typeof defaultValue === "boolean") {
        const raw = row.value;
        const boolValue =
          raw === true ||
          raw === "true" ||
          raw === 1 ||
          raw === "1" ||
          raw === "on";
        (base as any)[key] = boolValue;
        continue;
      }

      // Number settings
      const num = Number(row.value);
      (base as any)[key] = Number.isFinite(num) ? num : (defaultValue as number);
    }

    return base;
  }

  function markDirty() {
    setDirty(true);
  }

  function updateBoolean<K extends BooleanKey>(key: K, value: boolean) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    markDirty();
  }

  function updateNumber<K extends NumberKey>(key: K, value: number) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    markDirty();
  }

  /* ───────── Initial load ───────── */

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const { data, error } = await supabase
        .from("platform_settings")
        .select("key, value");

      if (cancelled) return;

      if (error) {
        console.error("[GodMode/settings] load error", error);
        toast({
          title: isNl ? "Fout bij laden" : "Failed to load settings",
          description:
            error.message ??
            (isNl
              ? "Instellingen konden niet worden opgehaald."
              : "Could not fetch platform settings."),
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setSettings(normalize((data ?? []) as Row[]));
      setLoading(false);
      setDirty(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [supabase, toast, isNl]);

  /* ───────── Save ───────── */

  async function handleSave() {
    setSaving(true);
    try {
      const rows = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
      }));

      const { error } = await supabase
        .from("platform_settings")
        .upsert(rows, { onConflict: "key" });

      if (error) throw error;

      toast({
        title: isNl ? "Instellingen opgeslagen" : "Settings saved",
        description: isNl
          ? "Platforminstellingen zijn succesvol bijgewerkt."
          : "Platform settings have been updated successfully.",
      });
      setDirty(false);
    } catch (err: any) {
      console.error("[GodMode/settings] save error", err);
      toast({
        title: isNl ? "Opslaan mislukt" : "Saving failed",
        description:
          err?.message ??
          (isNl ? "Probeer het later opnieuw." : "Please try again later."),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  /* ───────── UI ───────── */

  if (loading) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-8">
      {/* Header + Save */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {isNl ? "Platform instellingen" : "Platform settings"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isNl
              ? "God Mode: beheer globale instellingen voor Guide Me ABC."
              : "God Mode: manage global settings for Guide Me ABC."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {dirty && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              {isNl ? "Niet-opgeslagen wijzigingen" : "Unsaved changes"}
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="min-w-[140px]"
          >
            {saving && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            )}
            {isNl ? "Opslaan" : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* PLATFORM */}
        <Card className="border border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>{isNl ? "Platform" : "Platform"}</CardTitle>
            <CardDescription>
              {isNl
                ? "Globale status en basisgedrag van het platform."
                : "Global status and core behaviour of the platform."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Maintenance mode */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="font-medium">
                  {isNl ? "Maintenance mode" : "Maintenance mode"}
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isNl
                    ? "Zet het hele platform tijdelijk op slot voor bezoekers."
                    : "Temporarily lock the whole platform for visitors."}
                </p>
              </div>
              <Switch
                checked={settings.maintenance_mode}
                onCheckedChange={(v) => updateBoolean("maintenance_mode", v)}
              />
            </div>

            {/* Registrations */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="font-medium">
                  {isNl
                    ? "Nieuwe registraties toestaan"
                    : "Allow new registrations"}
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isNl
                    ? "Sta nieuwe accounts toe voor bedrijven en gebruikers."
                    : "Allow new business & user accounts to be created."}
                </p>
              </div>
              <Switch
                checked={settings.allow_registrations}
                onCheckedChange={(v) =>
                  updateBoolean("allow_registrations", v)
                }
              />
            </div>

            {/* Force email verification */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="font-medium">
                  {isNl
                    ? "E-mail verplicht verifiëren"
                    : "Force email verification"}
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isNl
                    ? "Accounts worden pas actief na bevestiging per e-mail."
                    : "Accounts only become active after e-mail confirmation."}
                </p>
              </div>
              <Switch
                checked={settings.force_email_verification}
                onCheckedChange={(v) =>
                  updateBoolean("force_email_verification", v)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* MODERATION */}
        <Card className="border border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>
              {isNl ? "Moderatie & veiligheid" : "Moderation & safety"}
            </CardTitle>
            <CardDescription>
              {isNl
                ? "Controleer hoe streng het platform omgaat met misbruik."
                : "Control how strict the platform is towards abuse."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Auto approve businesses */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="font-medium">
                  {isNl
                    ? "Bedrijven automatisch goedkeuren"
                    : "Auto-approve businesses"}
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isNl
                    ? "Nieuwe bedrijfsvermeldingen direct actief zetten."
                    : "Automatically activate new business listings."}
                </p>
              </div>
              <Switch
                checked={settings.auto_approve_businesses}
                onCheckedChange={(v) =>
                  updateBoolean("auto_approve_businesses", v)
                }
              />
            </div>

            {/* Auto approve reviews */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="font-medium">
                  {isNl
                    ? "Reviews automatisch goedkeuren"
                    : "Auto-approve reviews"}
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isNl
                    ? "Reviews direct tonen, tenzij gemarkeerd als verdacht."
                    : "Show reviews immediately unless flagged as suspicious."}
                </p>
              </div>
              <Switch
                checked={settings.auto_approve_reviews}
                onCheckedChange={(v) =>
                  updateBoolean("auto_approve_reviews", v)
                }
              />
            </div>

            {/* Auto block suspicious */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="font-medium">
                  {isNl
                    ? "Verdachte accounts automatisch blokkeren"
                    : "Auto-block suspicious accounts"}
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isNl
                    ? "Bij extreem misbruik kan een account automatisch worden geblokkeerd."
                    : "In case of heavy abuse, accounts can be auto-blocked."}
                </p>
              </div>
              <Switch
                checked={settings.auto_block_suspicious}
                onCheckedChange={(v) =>
                  updateBoolean("auto_block_suspicious", v)
                }
              />
            </div>

            {/* Rate limit level */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className="font-medium">
                    {isNl ? "Rate limit niveau" : "Rate limit level"}
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isNl
                      ? "1 = mild, 3 = streng. Bepaalt hoe snel mensen worden afgeremd."
                      : "1 = mild, 3 = strict. How aggressively abuse is throttled."}
                  </p>
                </div>
                <span className="text-xs font-medium">
                  {settings.rate_limit_level}
                </span>
              </div>
              <Slider
                min={1}
                max={3}
                step={1}
                value={[settings.rate_limit_level]}
                onValueChange={([v]) =>
                  updateNumber("rate_limit_level", v ?? 1)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* AI LIMITS */}
        <Card className="border border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>{isNl ? "AI-assistent" : "AI assistant"}</CardTitle>
            <CardDescription>
              {isNl
                ? "Limieten en gedrag van de AI voor ingelogde gebruikers."
                : "Limits and behaviour of the AI for logged-in users."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Free */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className="font-medium">
                    {isNl
                      ? "Max. AI-vragen per dag (free)"
                      : "Max AI questions per day (free)"}
                  </Label>
                </div>
                <span className="text-xs font-medium">
                  {settings.ai_max_free}
                </span>
              </div>
              <Slider
                min={0}
                max={50}
                step={1}
                value={[settings.ai_max_free]}
                onValueChange={([v]) =>
                  updateNumber("ai_max_free", v ?? 0)
                }
              />
            </div>

            {/* Premium */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className="font-medium">
                    {isNl
                      ? "Max. AI-vragen per dag (premium)"
                      : "Max AI questions per day (premium)"}
                  </Label>
                </div>
                <span className="text-xs font-medium">
                  {settings.ai_max_premium}
                </span>
              </div>
              <Slider
                min={10}
                max={200}
                step={5}
                value={[settings.ai_max_premium]}
                onValueChange={([v]) =>
                  updateNumber("ai_max_premium", v ?? 10)
                }
              />
            </div>

            {/* Temperature */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className="font-medium">
                    {isNl
                      ? "Creativiteit (temperature)"
                      : "Creativity (temperature)"}
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isNl
                      ? "0.0 = super feitelijk, 1.0 = creatief / losser."
                      : "0.0 = factual, 1.0 = more creative / loose."}
                  </p>
                </div>
                <span className="text-xs font-medium">
                  {settings.ai_temperature.toFixed(2)}
                </span>
              </div>
              <Slider
                min={0}
                max={1}
                step={0.05}
                value={[settings.ai_temperature]}
                onValueChange={([v]) =>
                  updateNumber(
                    "ai_temperature",
                    Number((v ?? 0).toFixed(2))
                  )
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* CONTENT / FEATURED */}
        <Card className="border border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>
              {isNl ? "Content & featured" : "Content & featured"}
            </CardTitle>
            <CardDescription>
              {isNl
                ? "Bepaal hoeveel je uitlicht per eiland en hoe listings sorteren."
                : "Control how much you highlight per island and how listings are sorted."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Featured per island */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className="font-medium">
                    {isNl
                      ? "Aantal 'featured' bedrijven per eiland"
                      : "Featured businesses per island"}
                  </Label>
                </div>
                <span className="text-xs font-medium">
                  {settings.featured_per_island}
                </span>
              </div>
              <Slider
                min={3}
                max={12}
                step={1}
                value={[settings.featured_per_island]}
                onValueChange={([v]) =>
                  updateNumber("featured_per_island", v ?? 6)
                }
              />
            </div>

            {/* Auto sort popular */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="font-medium">
                  {isNl
                    ? "Automatisch sorteren op populariteit"
                    : "Auto-sort by popularity"}
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isNl
                    ? "Combineer reviews, views en clicks om bedrijven automatisch te ranken."
                    : "Combine reviews, views and clicks to rank businesses automatically."}
                </p>
              </div>
              <Switch
                checked={settings.auto_sort_popular}
                onCheckedChange={(v) =>
                  updateBoolean("auto_sort_popular", v)
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}