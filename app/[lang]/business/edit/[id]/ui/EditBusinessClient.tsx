// app/[lang]/business/edit/[id]/ui/EditBusinessClient.tsx
"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { Loader2, ArrowLeft } from "lucide-react";

import { supabaseBrowser } from "@/lib/supabase/browser";
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

/* ----------------------------------------------------------------
   Helpers
----------------------------------------------------------------- */
const s = (v: string | null | undefined) => (v ?? "");
const toId = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/* ----------------------------------------------------------------
   Types (null-safe)
----------------------------------------------------------------- */
type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

type Island = "aruba" | "bonaire" | "curacao";

type ListingDbRow = {
  id: string;
  owner_id: string | null;
  business_name: string | null;
  island: Island | null;
  category_id: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  whatsapp: string | null;
  opening_hours: string | null;
  temporarily_closed: boolean | null;
  status: "pending" | "active" | "inactive" | null;
  subscription_plan: "starter" | "growth" | "pro" | null;
};

/* ----------------------------------------------------------------
   Zod schema (fix: lege strings moeten toegestaan zijn vóór email/url)
----------------------------------------------------------------- */
const EmailSchema = z.union([
  z.literal(""),
  z.string().trim().email("Ongeldig e-mailadres").max(255),
]);

const UrlSchema = z.union([
  z.literal(""),
  z
    .string()
    .trim()
    .url("Ongeldige URL (moet met http/https beginnen)")
    .max(255),
]);

const DigitsSchema = z.union([
  z.literal(""),
  z.string().trim().regex(/^[0-9]*$/, "Alleen cijfers"),
]);

const FormSchema = z.object({
  business_name: z.string().trim().min(2, "Bedrijfsnaam is verplicht"),
  island: z.enum(["aruba", "bonaire", "curacao"], {
    required_error: "Kies een eiland",
  }),
  category_id: z
    .union([z.literal(""), z.string().uuid()])
    .transform((val) => (val === "" ? null : val)),
  description: z.union([
    z.literal(""),
    z.string().trim().max(1000, "Maximaal 1000 tekens"),
  ]),
  address: z.union([
    z.literal(""),
    z.string().trim().max(200, "Maximaal 200 tekens"),
  ]),
  phone: z.union([z.literal(""), z.string().trim().max(50, "Maximaal 50 tekens")]),
  email: EmailSchema,
  website: UrlSchema,
  whatsapp: DigitsSchema,
  opening_hours: z.union([z.literal(""), z.string().trim()]), // JSON-string
  temporarily_closed: z.boolean().optional(),
});

type Props = {
  lang: Locale;
};

type FormState = {
  business_name: string;
  island: Island | "";
  category_id: string; // "" of uuid (we transformen naar null bij submit)
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  whatsapp: string;
  opening_hours: string;
  temporarily_closed: boolean;
};

export default function EditBusinessClient({ lang }: Props) {
  const router = useRouter();
  const params = useParams() as { id?: string | string[] };
  const id = toId(params.id) ?? "";

  const supabase = useMemo(() => supabaseBrowser(), []);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<FormState>({
    business_name: "",
    island: "",
    category_id: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    whatsapp: "",
    opening_hours: "",
    temporarily_closed: false,
  });

  const [categories, setCategories] = useState<CategoryRow[]>([]);

  /* ----------------------------------------------------------------
     Load categories + listing
  ----------------------------------------------------------------- */
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (!id) {
          router.replace(langHref(lang, "/business/dashboard"));
          return;
        }

        // 1) Auth check
        const { data: userResult } = await supabase.auth.getUser();
        const user = userResult?.user;

        if (!user) {
          router.replace(langHref(lang, "/business/auth"));
          return;
        }

        // 2) Categories (null-safe mapping)
        const { data: cats, error: catError } = await supabase
          .from("categories")
          .select("id,name,slug")
          .order("name", { ascending: true });

        if (catError) throw new Error(catError.message);
        if (!alive) return;

        const mappedCats: CategoryRow[] = (cats ?? []).map((c: any) => ({
          id: String(c.id),
          name: s(c.name),
          slug: s(c.slug),
        }));
        setCategories(mappedCats);

        // 3) Listing
        const { data: row, error: rowError } = await supabase
          .from("business_listings")
          .select(
            "id, owner_id, business_name, island, category_id, description, address, phone, email, website, whatsapp, opening_hours, temporarily_closed, status, subscription_plan"
          )
          .eq("id", id)
          .maybeSingle();

        if (rowError || !row) {
          toast({
            title: "Niet gevonden",
            description:
              "Deze bedrijfsvermelding bestaat niet of je hebt geen toegang.",
            variant: "destructive",
          });
          router.replace(langHref(lang, "/business/dashboard"));
          return;
        }

        const r = row as unknown as ListingDbRow;

        // Optioneel extra guard (handig bij debugging):
        // Als RLS goed staat, is dit niet nodig — maar het voorkomt verwarring in UI.
        if (r.owner_id && r.owner_id !== user.id) {
          toast({
            title: "Geen toegang",
            description: "Je hebt geen rechten om dit bedrijf te bewerken.",
            variant: "destructive",
          });
          router.replace(langHref(lang, "/business/dashboard"));
          return;
        }

        if (!alive) return;

        setForm({
          business_name: s(r.business_name),
          island: (r.island ?? "") as Island | "",
          category_id: r.category_id ?? "",
          description: s(r.description),
          address: s(r.address),
          phone: s(r.phone),
          email: s(r.email),
          website: s(r.website),
          whatsapp: s(r.whatsapp),
          opening_hours: s(r.opening_hours),
          temporarily_closed: !!r.temporarily_closed,
        });
      } catch (e: any) {
        toast({
          title: "Fout bij laden",
          description: e?.message ?? "Kon de gegevens niet ophalen.",
          variant: "destructive",
        });
        router.replace(langHref(lang, "/business/dashboard"));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id, lang, router, supabase, toast]);

  /* ----------------------------------------------------------------
     Submit
  ----------------------------------------------------------------- */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;

    const parsed = FormSchema.safeParse(form);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Ongeldige invoer.";
      toast({
        title: "Controleer je invoer",
        description: firstError,
        variant: "destructive",
      });
      return;
    }

    const data = parsed.data;

    try {
      setSaving(true);

      const payload = {
        business_name: data.business_name,
        island: data.island,
        category_id: data.category_id,
        description: data.description || null,
        address: data.address || null,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        whatsapp: data.whatsapp || null,
        opening_hours: data.opening_hours || null,
        temporarily_closed:
          typeof data.temporarily_closed === "boolean"
            ? data.temporarily_closed
            : form.temporarily_closed,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("business_listings")
        .update(payload)
        .eq("id", id);

      if (error) throw new Error(error.message);

      toast({
        title: "Opgeslagen",
        description: "Je wijzigingen zijn succesvol opgeslagen.",
      });

      router.replace(langHref(lang, "/business/dashboard"));
    } catch (err: any) {
      toast({
        title: "Fout",
        description:
          err?.message ??
          "Er ging iets mis bij het opslaan van je wijzigingen.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  /* ----------------------------------------------------------------
     Loading state
  ----------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /* ----------------------------------------------------------------
     UI (ongewijzigd)
  ----------------------------------------------------------------- */
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push(langHref(lang, "/business/dashboard"))}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Terug naar Dashboard
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Bedrijf bewerken</CardTitle>
          <CardDescription>Pas hier de gegevens van je bedrijf aan.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bedrijfsnaam */}
            <div className="space-y-2">
              <Label htmlFor="business_name">Bedrijfsnaam *</Label>
              <Input
                id="business_name"
                value={form.business_name}
                onChange={(e) =>
                  setForm((s) => ({ ...s, business_name: e.target.value }))
                }
                required
              />
            </div>

            {/* Eiland + Categorie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="island">Eiland *</Label>
                <select
                  id="island"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={form.island}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      island: e.target.value as Island | "",
                    }))
                  }
                  required
                >
                  <option value="" disabled>
                    Kies een eiland
                  </option>
                  <option value="aruba">Aruba</option>
                  <option value="bonaire">Bonaire</option>
                  <option value="curacao">Curaçao</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_id">Categorie</Label>
                <select
                  id="category_id"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={form.category_id}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, category_id: e.target.value }))
                  }
                >
                  <option value="">— Geen —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Beschrijving */}
            <div className="space-y-2">
              <Label htmlFor="description">Beschrijving</Label>
              <Textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm((s) => ({ ...s, description: e.target.value }))
                }
                placeholder="Vertel iets over je bedrijf..."
              />
            </div>

            {/* Adres */}
            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
              />
            </div>

            {/* Telefoon & WhatsApp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefoon</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp (alleen cijfers)</Label>
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

            {/* E-mail & Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mailadres</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website (https://…)</Label>
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

            {/* Openingstijden + tijdelijk gesloten */}
            <div className="space-y-2">
              <Label htmlFor="opening_hours">
                {lang === "nl" ? "Openingstijden" : "Opening hours"}
              </Label>

              <OpeningHoursField
                lang={lang}
                value={form.opening_hours}
                onChange={(v) => setForm((s) => ({ ...s, opening_hours: v }))}
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
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Wijzigingen opslaan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}