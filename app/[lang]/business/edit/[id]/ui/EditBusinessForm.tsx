"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import type { Locale } from "@/i18n/config";
import { langHref } from "@/lib/lang-href";
import { supabaseBrowser } from "@/lib/supabase/browser";

import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Business = {
  id: string;
  name: string | null;
  slug: string | null;
  description: string | null;
  island: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
};

type Category = {
  id: string;
  name: string;
};

type ListingBrief = {
  id: string;
  category_id: string | null;
};

type Props = {
  lang: Locale;
  business: Business;
};

function toNull(v: string) {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

function normIsland(v: string) {
  const s = String(v ?? "").toLowerCase().trim();
  if (s === "aruba" || s === "bonaire" || s === "curacao") return s;
  return null;
}

export default function EditBusinessForm({ lang, business }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = useMemo(() => supabaseBrowser() as any, []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [listingId, setListingId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string>("");

  const [form, setForm] = useState({
    name: business.name ?? "",
    island: business.island ?? "",
    description: business.description ?? "",
    phone: business.phone ?? "",
    whatsapp: business.whatsapp ?? "",
    email: business.email ?? "",
    website: business.website ?? "",
  });

  // laad categories + bestaande listing (als die er al is)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const { data: cats, error: cErr } = await supabase
          .from("categories")
          .select("id,name")
          .order("name", { ascending: true });

        if (cErr) throw cErr;

        const { data: listing, error: lErr } = await supabase
          .from("business_listings")
          .select("id,category_id")
          .eq("business_id", business.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (lErr) throw lErr;

        if (!alive) return;

        setCategories((cats ?? []) as Category[]);
        setListingId(listing?.id ?? null);
        setCategoryId(listing?.category_id ?? "");
      } catch (e: any) {
        if (!alive) return;
        setErrorMsg(e?.message ?? "Kon data niet laden.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [business.id, supabase]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const nameTrimmed = String(form.name ?? "").trim();
    if (nameTrimmed.length < 2) {
      setErrorMsg(lang === "nl" ? "Bedrijfsnaam is te kort." : "Business name is too short.");
      return;
    }

    if (!categoryId) {
      setErrorMsg(lang === "nl" ? "Kies een categorie." : "Please select a category.");
      return;
    }

    try {
      setSaving(true);

      // A) businesses = source of truth
      const { error: bErr } = await supabase
        .from("businesses")
        .update({
          name: nameTrimmed,
          description: toNull(form.description),
          island: normIsland(form.island),
          phone: toNull(form.phone),
          whatsapp: toNull(form.whatsapp),
          email: toNull(form.email),
          website: toNull(form.website),
        })
        .eq("id", business.id);

      if (bErr) throw bErr;

      // B) business_listings garanderen + category_id verplicht
      if (listingId) {
        const { error: lUpErr } = await supabase
          .from("business_listings")
          .update({
            category_id: categoryId,
            business_name: nameTrimmed,
            island: normIsland(form.island),
          })
          .eq("id", listingId);

        if (lUpErr) throw lUpErr;
      } else {
        const { error: lInsErr } = await supabase.from("business_listings").insert({
          business_id: business.id,
          business_name: nameTrimmed,
          island: normIsland(form.island),
          category_id: categoryId,
          status: "pending",
          subscription_plan: "starter",
        });

        if (lInsErr) throw lInsErr;
      }

      toast({
        title: lang === "nl" ? "Opgeslagen" : "Saved",
        description: lang === "nl" ? "Je profiel is bijgewerkt." : "Your profile was updated.",
      });

      router.replace(langHref(lang, "/business/dashboard"));
    } catch (e: any) {
      const msg = e?.message ?? (lang === "nl" ? "Opslaan mislukt." : "Save failed.");
      setErrorMsg(msg);
      toast({
        title: lang === "nl" ? "Fout" : "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{lang === "nl" ? "Profiel bewerken" : "Edit profile"}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {errorMsg ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
              {errorMsg}
            </div>
          ) : null}

          <form onSubmit={onSave} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{lang === "nl" ? "Bedrijfsnaam" : "Business name"} *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="island">{lang === "nl" ? "Eiland" : "Island"}</Label>
                <select
                  id="island"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={form.island ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, island: e.target.value }))}
                >
                  <option value="">{lang === "nl" ? "Kies…" : "Select…"}</option>
                  <option value="aruba">Aruba</option>
                  <option value="bonaire">Bonaire</option>
                  <option value="curacao">Curaçao</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_id">{lang === "nl" ? "Categorie" : "Category"} *</Label>
                <select
                  id="category_id"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    {lang === "nl" ? "Kies een categorie" : "Select a category"}
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {lang === "nl"
                      ? "Geen categorieën gevonden. Vul eerst categories in de database."
                      : "No categories found. Please seed the categories table first."}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{lang === "nl" ? "Omschrijving" : "Description"}</Label>
              <Textarea
                id="description"
                rows={5}
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{lang === "nl" ? "Telefoon" : "Phone"}</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={form.whatsapp}
                  onChange={(e) => setForm((s) => ({ ...s, whatsapp: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">{lang === "nl" ? "Website" : "Website"}</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://..."
                  value={form.website}
                  onChange={(e) => setForm((s) => ({ ...s, website: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push(langHref(lang, "/business/dashboard"))}
                disabled={saving}
              >
                {lang === "nl" ? "Annuleren" : "Cancel"}
              </Button>

              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {lang === "nl" ? "Opslaan..." : "Saving..."}
                  </>
                ) : lang === "nl" ? (
                  "Opslaan"
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}