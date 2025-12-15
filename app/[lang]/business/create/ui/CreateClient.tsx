// app/[lang]/business/create/ui/CreateClient.tsx
"use client";

import { useActionState, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import type { Locale } from "@/i18n/config";
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

import OpeningHoursField from "@/components/business/OpeningHoursField";

// 👇 server action (Optie A)
import { createBusinessWithListingAction } from "../actions";

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

type State = { error?: string };

export default function CreateClient({
  lang,
  t,
  categories = [],
}: CreateClientProps) {
  const router = useRouter();

  // bind lang aan de server action
  const action = useMemo(
    () => createBusinessWithListingAction.bind(null, lang),
    [lang],
  );

  const [state, formAction, pending] = useActionState<State, FormData>(
    async (prev, fd) => action(prev, fd),
    {},
  );

  // client-only state voor OpeningHoursField en checkbox
  const [openingHours, setOpeningHours] = useState<string>("");
  const [temporarilyClosed, setTemporarilyClosed] = useState<boolean>(false);

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Button
        variant="ghost"
        className="mb-6"
        type="button"
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
          {state?.error ? (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
              {state.error}
            </div>
          ) : null}

          {/* ✅ server action form */}
          <form action={formAction} className="space-y-6">
            {/* naam */}
            <div className="space-y-2">
              <Label htmlFor="name">{t.businessName ?? "Bedrijfsnaam"} *</Label>
              <Input id="name" name="name" required placeholder="Bijv. Aruba Car Rentals" />
            </div>

            {/* eiland + categorie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="island">{t.island ?? "Eiland"} *</Label>
                <select
                  id="island"
                  name="island"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  defaultValue=""
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
                <Label htmlFor="category_id">{t.category ?? "Categorie"} *</Label>
                <select
                  id="category_id"
                  name="category_id"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    {t.selectCategory ?? "Kies een categorie"}
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {categories.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {t.noCategories ??
                      "Geen categorieën geladen. Check of categories in de DB bestaan en page.tsx ze doorgeeft."}
                  </p>
                ) : null}
              </div>
            </div>

            {/* beschrijving */}
            <div className="space-y-2">
              <Label htmlFor="description">{t.description ?? "Beschrijving"}</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                placeholder={
                  t.descriptionPlaceholder ?? "Vertel iets over je bedrijf…"
                }
              />
            </div>

            {/* adres */}
            <div className="space-y-2">
              <Label htmlFor="address">{t.address ?? "Adres"}</Label>
              <Input id="address" name="address" />
            </div>

            {/* telefoon & whatsapp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t.phone ?? "Telefoon"}</Label>
                <Input id="phone" name="phone" type="tel" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" name="whatsapp" inputMode="numeric" />
              </div>
            </div>

            {/* email & website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.email ?? "E-mailadres"}</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">{t.website ?? "Website"}</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* openingstijden + tijdelijk gesloten */}
            <div className="space-y-2">
              <Label>{lang === "nl" ? "Openingstijden" : "Opening hours"}</Label>

              <OpeningHoursField
                lang={lang}
                value={openingHours}
                onChange={(v: string) => setOpeningHours(v)}
              />

              {/* ✅ hidden naar server action */}
              <input type="hidden" name="opening_hours" value={openingHours} />

              <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border"
                  checked={temporarilyClosed}
                  onChange={(e) => setTemporarilyClosed(e.target.checked)}
                />
                {lang === "nl"
                  ? "Tijdelijk gesloten (toon 'Nu gesloten' op de mini-site)"
                  : "Temporarily closed (show 'Closed now' on mini-site)"}
              </label>

              <input
                type="hidden"
                name="temporarily_closed"
                value={temporarilyClosed ? "1" : "0"}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              variant="primaryGrad"
              disabled={pending}
            >
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pending ? (t.saving ?? "Bezig...") : (t.createBusinessCta ?? "Bedrijf aanmaken")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}