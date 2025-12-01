// app/[lang]/business/create/ui/CreateClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { supabaseBrowser } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { langHref } from "@/lib/lang-href";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Locale } from "@/i18n/config";
import OpeningHoursField from "@/components/business/OpeningHoursField";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

type CreateClientProps = {
  lang: Locale;
  t: Record<string, string>;
  categories?: CategoryRow[];
};

export default function CreateClient({
  lang,
  t,
  categories = [],
}: CreateClientProps) {
  const router = useRouter();

  const supabase = useMemo(() => supabaseBrowser(), []);
  const { toast } = useToast();

  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    business_name: "",
    island: "",
    category_id: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    whatsapp: "",
    opening_hours: "", // JSON string
    temporarily_closed: false,
  });

  /* ---------- Auth check ---------- */
  useEffect(() => {
    let alive = true;

    (async () => {
      const { data, error } = await supabase.auth.getUser();
      console.log("[business/create] getUser:", {
        user: data?.user,
        error,
      });

      if (!alive) return;

      if (!data?.user) {
        router.replace(langHref(lang, "/business/auth"));
      } else {
        setUserId(data.user.id);
        setAuthLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [lang, router, supabase]);

  /* ---------- Submit ---------- */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!userId) {
      toast({
        title: t.error ?? "Fout",
        description:
          t.fillRequired ??
          (lang === "nl"
            ? "Je moet ingelogd zijn om een bedrijf aan te maken."
            : "You must be logged in to create a business."),
        variant: "destructive",
      });
      return;
    }

    if (!form.business_name || !form.island) {
      toast({
        title: t.missingRequired ?? "Verplichte velden ontbreken",
        description:
          t.fillRequired ??
          (lang === "nl"
            ? "Vul minimaal een bedrijfsnaam en het eiland in."
            : "Please provide at least a business name and island."),
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase.from("business_listings").insert({
        owner_id: userId,
        business_name: form.business_name,
        island: form.island,
        category_id: form.category_id || null,
        description: form.description || null,
        address: form.address || null,
        phone: form.phone || null,
        email: form.email || null,
        website: form.website || null,
        whatsapp: form.whatsapp || null,
        opening_hours: form.opening_hours || null, // JSON string
        temporarily_closed: form.temporarily_closed,
        status: "pending",
        subscription_plan: "starter",
      });

      if (error) throw new Error(error.message);

      toast({
        title: t.created ?? "Bedrijf aangemaakt",
        description:
          t.addFirstBusiness ??
          (lang === "nl"
            ? "Je bedrijf is aangemaakt en wordt gecontroleerd."
            : "Your business was created and will be reviewed."),
      });

      router.replace(langHref(lang, "/business/dashboard"));
    } catch (err: any) {
      toast({
        title: t.error ?? "Fout",
        description:
          err?.message ??
          t.saveError ??
          (lang === "nl"
            ? "Er ging iets mis bij het opslaan van je bedrijf."
            : "Something went wrong while saving your business."),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  /* ---------- UI ---------- */

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push(langHref(lang, "/business/dashboard"))}
      >
        {t.backToDashboard ?? "Terug naar dashboard"}
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{t.businessCreateTitle ?? "Nieuw bedrijf"}</CardTitle>
          <CardDescription>
            {t.businessCreateSubtitle ??
              "Registreer je bedrijf om gevonden te worden op de ABC-eilanden."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* naam */}
            <div className="space-y-2">
              <Label htmlFor="business_name">
                {t.businessName ?? "Bedrijfsnaam"} *
              </Label>
              <Input
                id="business_name"
                value={form.business_name}
                onChange={(e) =>
                  setForm((s) => ({ ...s, business_name: e.target.value }))
                }
                required
              />
            </div>

            {/* eiland + categorie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="island">{t.island ?? "Eiland"} *</Label>
                <select
                  id="island"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={form.island}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, island: e.target.value }))
                  }
                  required
                >
                  <option value="" disabled>
                    {t.selectIsland ?? "Kies een eiland"}
                  </option>
                  <option value="aruba">Aruba</option>
                  <option value="bonaire">Bonaire</option>
                  <option value="curacao">Curaçao</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_id">
                  {t.category ?? "Categorie"}
                </Label>
                <select
                  id="category_id"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={form.category_id}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, category_id: e.target.value }))
                  }
                >
                  <option value="">{t.none ?? "— Geen —"}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* beschrijving */}
            <div className="space-y-2">
              <Label htmlFor="description">
                {t.description ?? "Beschrijving"}
              </Label>
              <Textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm((s) => ({ ...s, description: e.target.value }))
                }
                placeholder={
                  t.descriptionPlaceholder ?? "Vertel iets over je bedrijf…"
                }
              />
            </div>

            {/* adres */}
            <div className="space-y-2">
              <Label htmlFor="address">{t.address ?? "Adres"}</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) =>
                  setForm((s) => ({ ...s, address: e.target.value }))
                }
              />
            </div>

            {/* telefoon & whatsapp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t.phone ?? "Telefoon"}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, phone: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  inputMode="numeric"
                  value={form.whatsapp}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, whatsapp: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* email & website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.email ?? "E-mailadres"}</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">{t.website ?? "Website"}</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://..."
                  value={form.website}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, website: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* openingstijden + tijdelijk gesloten */}
            <div className="space-y-2">
              <Label htmlFor="opening_hours">
                {lang === "nl" ? "Openingstijden" : "Opening hours"}
              </Label>

              <OpeningHoursField
                lang={lang}
                value={form.opening_hours}
                onChange={(v) =>
                  setForm((s) => ({ ...s, opening_hours: v }))
                }
              />

              <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border"
                  checked={form.temporarily_closed}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      temporarily_closed: e.target.checked,
                    }))
                  }
                />
                {lang === "nl"
                  ? "Tijdelijk gesloten (toon 'Nu gesloten' op de mini-site)"
                  : "Temporarily closed (show 'Closed now' on mini-site)"}
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              variant="primaryGrad"
              disabled={saving}
            >
              {saving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t.createBusinessCta ?? "Bedrijf aanmaken"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}