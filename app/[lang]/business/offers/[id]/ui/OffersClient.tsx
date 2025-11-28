// app/[lang]/business/offers/[id]/ui/OffersClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { z } from "zod";
import { Plus, Loader2, Trash2, Pencil, ArrowLeft } from "lucide-react";

import { supabaseBrowser } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { langHref } from "@/lib/lang-href";
import { getLangFromPath } from "@/lib/locale-path";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Locale } from "@/i18n/config";

type OfferRow = {
  id: string;
  business_id: string;
  title: string | null;
  description: string | null;
  price: string | null;
  valid_until: string | null; // ISO date string
  image_url: string | null;
  created_at: string;
};

type Props = {
  lang: Locale;
  businessId: string;
  businessName: string;
  t: Record<string, string>;
};

const offerSchema = z.object({
  title: z.string().trim().min(2, "Titel is verplicht"),
  description: z
    .string()
    .trim()
    .max(1000, "Maximaal 1000 tekens")
    .optional()
    .or(z.literal("")),
  price: z.string().trim().max(100, "Te lang").optional().or(z.literal("")),
  valid_until: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  image_url: z
    .string()
    .trim()
    .url("Ongeldige URL (moet met http/https beginnen)")
    .max(500)
    .optional()
    .or(z.literal("")),
});

type FormState = {
  id?: string; // bij edit
  title: string;
  description: string;
  price: string;
  valid_until: string;
  image_url: string;
};

export default function OffersClient({
  lang,
  businessId,
  businessName,
}: Props) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const resolvedLang = (getLangFromPath(pathname) || lang) as Locale;

  const supabase = useMemo(() => supabaseBrowser(), []);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    price: "",
    valid_until: "",
    image_url: "",
  });

  const isNL = resolvedLang === "nl";

  const labels = {
    pageTitle: isNL ? "Aanbiedingen beheren" : "Manage offers",
    pageSubtitle: isNL
      ? "Voeg aanbiedingen toe voor je mini-site. Alleen PRO-bedrijven tonen aanbiedingen."
      : "Add special offers for your mini-site. Only PRO businesses show offers.",
    backToDashboard: isNL ? "Terug naar dashboard" : "Back to dashboard",
    addNew: isNL ? "Nieuwe aanbieding" : "New offer",
    saveOffer: isNL ? "Aanbieding opslaan" : "Save offer",
    updateOffer: isNL ? "Aanbieding bijwerken" : "Update offer",
    title: isNL ? "Titel" : "Title",
    description: isNL ? "Omschrijving" : "Description",
    price: isNL ? "Prijs" : "Price",
    pricePlaceholder: isNL ? "Bijv: € 39,95" : "e.g. $39.95",
    validUntil: isNL ? "Geldig tot" : "Valid until",
    imageUrl: isNL ? "Afbeeldings-URL" : "Image URL",
    imageHelp: isNL
      ? "Optioneel. Een afbeelding (bijv. van Supabase Storage of je website)."
      : "Optional. Image URL (e.g. from Supabase Storage or your site).",
    noOffers: isNL
      ? "Nog geen aanbiedingen toegevoegd."
      : "No offers yet.",
    deleteConfirm: isNL
      ? "Weet je zeker dat je deze aanbieding wilt verwijderen?"
      : "Are you sure you want to delete this offer?",
  };

  /* ---------------------------------------
   * Load offers (alleen voor deze business)
   * ------------------------------------- */
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("business_offers")
          .select("*")
          .eq("business_id", businessId)
          .order("created_at", { ascending: false });

        if (!alive) return;
        if (error) throw new Error(error.message);

        setOffers(data ?? []);
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err?.message ?? "Kon aanbiedingen niet laden.",
        });
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [businessId, supabase, toast]);

  /* ------------------------
   * Helpers
   * ---------------------- */
  function resetForm() {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      price: "",
      valid_until: "",
      image_url: "",
    });
  }

  function startEdit(o: OfferRow) {
    setEditingId(o.id);
    setForm({
      id: o.id,
      title: o.title ?? "",
      description: o.description ?? "",
      price: o.price ?? "",
      valid_until: o.valid_until?.slice(0, 10) ?? "",
      image_url: o.image_url ?? "",
    });
  }

  /* ------------------------
   * Save (create / update)
   * ---------------------- */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = offerSchema.safeParse(form);
    if (!parsed.success) {
      const msg =
        parsed.error.issues[0]?.message ??
        (isNL ? "Controleer je invoer." : "Please check your input.");
      toast({
        variant: "destructive",
        title: "Error",
        description: msg,
      });
      return;
    }

    const values = parsed.data;

    try {
      setSaving(true);

      if (editingId) {
        // UPDATE
        const { error } = await supabase
          .from("business_offers")
          .update({
            title: values.title,
            description: values.description || null,
            price: values.price || null,
            valid_until: values.valid_until || null,
            image_url: values.image_url || null,
          })
          .eq("id", editingId);

        if (error) throw new Error(error.message);

        setOffers((prev) =>
          prev.map((o) =>
            o.id === editingId
              ? {
                  ...o,
                  title: values.title,
                  description: values.description || null,
                  price: values.price || null,
                  valid_until: values.valid_until || null,
                  image_url: values.image_url || null,
                }
              : o
          )
        );

        toast({
          title: isNL ? "Aanbieding bijgewerkt" : "Offer updated",
        });
      } else {
        // INSERT
        const { data, error } = await supabase
          .from("business_offers")
          .insert({
            business_id: businessId,
            title: values.title,
            description: values.description || null,
            price: values.price || null,
            valid_until: values.valid_until || null,
            image_url: values.image_url || null,
          })
          .select("*")
          .single<OfferRow>();

        if (error) throw new Error(error.message);

        if (data) {
          setOffers((prev) => [data, ...prev]);
        }

        toast({
          title: isNL ? "Aanbieding aangemaakt" : "Offer created",
        });
      }

      resetForm();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err?.message ??
          (isNL
            ? "Er ging iets mis bij het opslaan."
            : "Something went wrong while saving."),
      });
    } finally {
      setSaving(false);
    }
  }

  /* ------------------------
   * Delete
   * ---------------------- */
  async function handleDelete(id: string) {
    if (!confirm(labels.deleteConfirm)) return;

    try {
      const { error } = await supabase
        .from("business_offers")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);

      setOffers((prev) => prev.filter((o) => o.id !== id));

      toast({
        title: isNL ? "Verwijderd" : "Deleted",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err?.message ??
          (isNL
            ? "Kon de aanbieding niet verwijderen."
            : "Could not delete the offer."),
      });
    }
  }

  /* ------------------------
   * UI
   * ---------------------- */

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() =>
            router.push(langHref(resolvedLang, "/business/dashboard"))
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {labels.backToDashboard}
        </Button>

        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {isNL ? "Voor" : "For"}
          </p>
          <p className="font-semibold text-sm text-foreground">
            {businessName}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Formulier */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {editingId ? labels.updateOffer : labels.addNew}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">{labels.title} *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, title: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">{labels.description}</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, description: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="price">{labels.price}</Label>
                  <Input
                    id="price"
                    value={form.price}
                    placeholder={labels.pricePlaceholder}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, price: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="valid_until">{labels.validUntil}</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={form.valid_until}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, valid_until: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="image_url">{labels.imageUrl}</Label>
                <Input
                  id="image_url"
                  placeholder="https://..."
                  value={form.image_url}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, image_url: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {labels.imageHelp}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4
                  animate-spin" />}
                  {!saving && <Plus className="mr-2 h-4 w-4"/>}
                  {editingId ? labels.updateOffer : labels.saveOffer}
                </Button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    {isNL ? "Annuleren" : "Cancel"}
                  </button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Lijst met aanbiedingen */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {labels.pageTitle}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {labels.pageSubtitle}
            </p>
          </CardHeader>
          <CardContent>
            {offers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {labels.noOffers}
              </p>
            ) : (
              <div className="space-y-4">
                {offers.map((o) => (
                  <div
                    key={o.id}
                    className="rounded-xl border border-border/70 bg-background/70 px-4 py-3 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">
                          {o.title ?? "—"}
                        </h3>
                        {o.price && (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-medium text-emerald-900">
                            {o.price}
                          </span>
                        )}
                      </div>

                      {o.description && (
                        <p className="text-xs text-muted-foreground">
                          {o.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mt-1">
                        {o.valid_until && (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                            {isNL ? "Geldig t/m" : "Valid until"}{" "}
                            {o.valid_until.slice(0, 10)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(o)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        {isNL ? "Bewerken" : "Edit"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outlineSoft"
                        onClick={() => handleDelete(o.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        {isNL ? "Verwijderen" : "Delete"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}