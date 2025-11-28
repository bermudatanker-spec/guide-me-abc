// app/[lang]/business/edit/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { z } from "zod";
import { Loader2, ArrowLeft } from "lucide-react";

import { supabaseBrowser } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { langHref } from "@/lib/lang-href";
import { getLangFromPath } from "@/lib/locale-path";

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
  opening_hours: string | null;
  temporarily_closed: boolean | null;
  status: "pending" | "active" | "inactive";
  subscription_plan: "starter" | "growth" | "pro";
};

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
  opening_hours: z
    .string()
    .trim()
    .max(1200, "Maximaal 1200 tekens")
    .optional()
    .or(z.literal("")),
  temporarily_closed: z.boolean(),
});

export default function EditBusinessPage() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const lang = (getLangFromPath(pathname) || "en") as "nl" | "en" | "pap" | "es";

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
    opening_hours: string;
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

  const isNl = lang === "nl";

  // -------------------- Load categories + listing -------------------- //
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // Auth check
        const { data: userResult } = await supabase.auth.getUser();
        if (!userResult?.user) {
          router.replace(langHref(lang, "/business/auth"));
          return;
        }

        // Categories
        const { data: cats, error: catError } = await supabase
          .from("categories")
          .select("id, name, slug")
          .order("name", { ascending: true });

        if (catError) throw new Error(catError.message);
        if (!alive) return;
        setCategories(cats ?? []);

        // Listing
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
          opening_hours: row.opening_hours ?? "",
          temporarily_closed: row.temporarily_closed ?? false,
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

  // ----------------------------- Submit ----------------------------- //
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
          opening_hours: data.opening_hours || null,
          temporarily_closed: data.temporarily_closed ?? false,
        })
        .eq("id", id);

      if (error) throw new Error(error.message);

      toast({
        title: isNl ? "Opgeslagen" : "Saved",
        description: isNl
          ? "Je wijzigingen zijn succesvol opgeslagen."
          : "Your changes have been saved.",
      });

      router.replace(langHref(lang, "/business/dashboard"));
    } catch (err: any) {
      toast({
        title: isNl ? "Fout" : "Error",
        description:
          err?.message ??
          (isNl
            ? "Er ging iets mis bij het opslaan van je wijzigingen."
            : "Something went wrong while saving your changes."),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------- Loading ---------------------------- //
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ------------------------------ UI ------------------------------ //
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push(langHref(lang, "/business/dashboard"))}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {isNl ? "Terug naar Dashboard" : "Back to dashboard"}
      </Button>

      <Card className="max-w-2xl mx-auto shadow-card">
        <CardHeader>
          <CardTitle>
            {isNl ? "Bedrijf bewerken" : "Edit business"}
          </CardTitle>
          <CardDescription>
            {isNl
              ? "Pas hier de gegevens van je bedrijf aan."
              : "Update your business details here."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bedrijfsnaam */}
            <div className="space-y-2">
              <Label htmlFor="business_name">
                {isNl ? "Bedrijfsnaam" : "Business name"} *
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

            {/* Eiland + Categorie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="island">
                  {isNl ? "Eiland" : "Island"} *
                </Label>
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
                    {isNl ? "Kies een eiland" : "Choose an island"}
                  </option>
                  <option value="aruba">Aruba</option>
                  <option value="bonaire">Bonaire</option>
                  <option value="curacao">Curaçao</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_id">
                  {isNl ? "Categorie" : "Category"}
                </Label>
                <select
                  id="category_id"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={form.category_id}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      category_id: e.target.value,
                    }))
                  }
                >
                  <option value="">
                    {isNl ? "— Geen —" : "— None —"}
                  </option>
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
              <Label htmlFor="description">
                {isNl ? "Beschrijving" : "Description"}
              </Label>
              <Textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm((s) => ({ ...s, description: e.target.value }))
                }
                placeholder={
                  isNl
                    ? "Vertel iets over je bedrijf..."
                    : "Tell something about your business..."
                }
              />
            </div>

            {/* Adres */}
            <div className="space-y-2">
              <Label htmlFor="address">
                {isNl ? "Adres" : "Address"}
              </Label>
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
                <Label htmlFor="phone">
                  {isNl ? "Telefoon" : "Phone"}
                </Label>
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
                <Label htmlFor="whatsapp">
                  {isNl ? "WhatsApp (alleen cijfers)" : "WhatsApp (digits only)"}
                </Label>
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
                <Label htmlFor="email">
                  {isNl ? "E-mailadres" : "Email"}
                </Label>
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
                <Label htmlFor="website">
                  {isNl ? "Website (https://…)" : "Website (https://…)"}
                </Label>
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
            <div className="space-y-3">
              <Label htmlFor="opening_hours">
                {isNl ? "Openingstijden" : "Opening hours"}
              </Label>
              <Textarea
                id="opening_hours"
                rows={5}
                value={form.opening_hours}
                onChange={(e) =>
                  setForm((s) => ({ ...s, opening_hours: e.target.value }))
                }
                placeholder={
                  isNl
                    ? "Maandag: 09:00 – 18:00\nDinsdag: 09:00 – 18:00\nWoensdag: Gesloten\n..."
                    : "Monday: 09:00 – 6:00 PM\nTuesday: 09:00 – 6:00 PM\nWednesday: Closed\n..."
                }
              />
              <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border border-border"
                  checked={form.temporarily_closed}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      temporarily_closed: e.target.checked,
                    }))
                  }
                />
                <span>
                  {isNl
                    ? "Tijdelijk gesloten (toon 'Nu gesloten' op de mini-site)"
                    : "Temporarily closed (show 'Closed now' on the mini-site)"}
                </span>
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
              {isNl ? "Wijzigingen opslaan" : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}