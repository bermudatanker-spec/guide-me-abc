// app/[lang]/business/edit/[id]/ui/EditBusinessClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { Loader2, ArrowLeft } from "lucide-react";

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

/* ----------------------------------------------------------------
   Types — sluiten aan op je DB schema
----------------------------------------------------------------- */

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

type ListingRow = {
  id: string;
  owner_id: string;
  business_name: string;
  island: "aruba" | "bonaire" | "curacao";
  category_id: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  whatsapp: string | null;
  opening_hours: string | null;        // JSON-string uit OpeningHoursField
  temporarily_closed: boolean | null;
  status: "pending" | "active" | "inactive";
  subscription_plan: "starter" | "growth" | "pro";
};

/* ----------------------------------------------------------------
   Zod schema voor validatie
----------------------------------------------------------------- */

const FormSchema = z.object({
  business_name: z.string().trim().min(2, "Bedrijfsnaam is verplicht"),
  island: z.enum(["aruba", "bonaire", "curacao"], {
    required_error: "Kies een eiland",
  }),
  category_id: z
    .string()
    .uuid()
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? null : val)),
  description: z
    .string()
    .trim()
    .max(1000, "Maximaal 1000 tekens")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .max(200, "Maximaal 200 tekens")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(50, "Maximaal 50 tekens")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Ongeldig e-mailadres")
    .max(255)
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .trim()
    .url("Ongeldige URL (moet met http/https beginnen)")
    .max(255)
    .optional()
    .or(z.literal("")),
  whatsapp: z
    .string()
    .trim()
    .regex(/^[0-9]*$/, "Alleen cijfers")
    .optional()
    .or(z.literal("")),
  opening_hours: z.string().trim().optional().or(z.literal("")), // JSON-string
  temporarily_closed: z.boolean().optional(),
});

type Props = {
  lang: Locale;
};

export default function EditBusinessClient({ lang }: Props) {
  const router = useRouter();
  const params = useParams() as { id: string };
  const id = params.id;

  const supabase = useMemo(() => supabaseBrowser(), []);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<{
    business_name: string;
    island: "aruba" | "bonaire" | "curacao" | "";
    category_id: string | "";
    description: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    whatsapp: string;
    opening_hours: string;        // JSON-string of ""
    temporarily_closed: boolean;
  }>({
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
     Ophalen categorieën + bestaande listing
  ----------------------------------------------------------------- */

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // 1) Auth check
        const { data: userResult } = await supabase.auth.getUser();
        if (!userResult?.user) {
          router.replace(langHref(lang, "/business/auth"));
          return;
        }

        // 2) Categorieën
        const { data: cats, error: catError } = await supabase
          .from("categories")
          .select("id, name, slug")
          .order("name", { ascending: true });

        if (catError) throw new Error(catError.message);
        if (!alive) return;
        setCategories(cats ?? []);

        // 3) Bestaande listing
        const { data: row, error: rowError } = await supabase
          .from("business_listings")
          .select(
            "id, owner_id, business_name, island, category_id, description, address, phone, email, website, whatsapp, opening_hours, temporarily_closed, status, subscription_plan"
          )
          .eq("id", id)
          .single<ListingRow>();

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

        if (!alive) return;

        setForm({
          business_name: row.business_name ?? "",
          island: (row.island as "aruba" | "bonaire" | "curacao") ?? "",
          category_id: row.category_id ?? "",
          description: row.description ?? "",
          address: row.address ?? "",
          phone: row.phone ?? "",
          email: row.email ?? "",
          website: row.website ?? "",
          whatsapp: row.whatsapp ?? "",
          opening_hours: row.opening_hours ?? "",   // JSON-string uit DB
          temporarily_closed: !!row.temporarily_closed,
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = FormSchema.safeParse(form);
    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "Ongeldige invoer.";
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

      const { error } = await supabase
        .from("business_listings")
        .update({
          business_name: data.business_name,
          island: data.island,
          category_id: data.category_id,
          description: data.description || null,
          address: data.address || null,
          phone: data.phone || null,
          email: data.email || null,
          website: data.website || null,
          whatsapp: data.whatsapp || null,
          // hier gewoon de JSON-string opslaan
          opening_hours: form.opening_hours || null,
          temporarily_closed: form.temporarily_closed,
        })
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
     UI
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
          <CardDescription>
            Pas hier de gegevens van je bedrijf aan.
          </CardDescription>
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
                      island: e.target.value as
                        | "aruba"
                        | "bonaire"
                        | "curacao"
                        | "",
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
                onChange={(e) =>
                  setForm((s) => ({ ...s, address: e.target.value }))
                }
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
                  onChange={(e) =>
                    setForm((s) => ({ ...s, phone: e.target.value }))
                  }
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
                  onChange={(e) =>
                    setForm((s) => ({ ...s, email: e.target.value }))
                  }
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
                value={form.opening_hours}      // JSON-string
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
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Wijzigingen opslaan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}