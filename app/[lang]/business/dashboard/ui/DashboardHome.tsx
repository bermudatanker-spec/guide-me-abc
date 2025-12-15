"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Pencil,
  Globe,
  Lock,
  Sparkles,
  BarChart3,
  Loader2,
  Trash2,
  RotateCcw,
} from "lucide-react";

import type { Locale } from "@/i18n/config";
import { langHref } from "@/lib/lang-href";
import { supabaseBrowser } from "@/lib/supabase/browser";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { useToast } from "@/hooks/use-toast";

// ✅ server actions
import { softDeleteBusinessAction, undoDeleteBusinessAction } from "../actions";

type DashboardCaps = {
  maxCategories: number;
  maxLocations: number;
  maxDeals: number;
  maxPhotos: number;
  maxVideos: number;
  canMiniSite: boolean; // ✅ consequent
};

type Business = {
  id: string;
  user_id: string;
  name: string | null;
  island: string | null;
  slug: string | null;
  plan: string | null;
  deleted_at?: string | null;
};

type Listing = {
  id: string;
  business_id: string;
  business_name: string | null;
  island: string | null;
  status: string | null;
  subscription_plan: string | null;
  deleted_at?: string | null;
};

type Props = {
  lang: Locale;
  business: Business;
  caps: DashboardCaps;
};

function normalizePlan(plan: unknown): "starter" | "growth" | "pro" {
  const p = String(plan ?? "").trim().toLowerCase();
  if (p === "pro") return "pro";
  if (p === "growth") return "growth";
  return "starter";
}

function normalizeStatus(status: unknown): "pending" | "active" | "inactive" {
  const s = String(status ?? "").trim().toLowerCase();
  if (s === "active") return "active";
  if (s === "inactive") return "inactive";
  return "pending";
}

export default function DashboardHome({ lang, business, caps }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = useMemo(() => supabaseBrowser(), []);
  const redirectingRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [listing, setListing] = useState<Listing | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteNote, setDeleteNote] = useState("");
  const [undoNote, setUndoNote] = useState("");

  const [pending, startTransition] = useTransition();

  // ✅ Load: listing + role
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        // 1) auth + role
        const { data: authData, error: authErr } = await supabase.auth.getUser();
        if (!alive) return;
        if (authErr) throw new Error(authErr.message);

        const user = authData?.user;
        if (!user) {
          if (!redirectingRef.current) {
            redirectingRef.current = true;
            router.replace(langHref(lang, "/business/auth"));
          }
          return;
        }

        const role = (user.app_metadata as any)?.role ?? (user as any)?.role;
        setIsAdmin(role === "super_admin");

        // 2) listing op business_id (consequent!)
        const { data: l, error: lErr } = await supabase
          .from("business_listings")
          .select("id, business_id, business_name, island, status, subscription_plan, deleted_at")
          .eq("business_id", business.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle<Listing>();

        if (!alive) return;
        if (lErr) throw new Error(lErr.message);

        setListing(l ?? null);
      } catch (e: any) {
        if (!alive) return;
        setErrorMsg(e?.message ?? "Onbekende fout");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [supabase, router, lang, business.id]);

  const plan = useMemo(
    () => normalizePlan(listing?.subscription_plan ?? business.plan),
    [listing?.subscription_plan, business.plan]
  );
  const status = useMemo(() => normalizeStatus(listing?.status), [listing?.status]);

  const title = lang === "nl" ? "Dashboard" : "Dashboard";

  const businessName = (listing?.business_name?.trim() || business?.name?.trim() || "—") as string;
  const island = (listing?.island || business?.island || "—")?.toString()?.trim();

  const showOpenMiniSite = status === "active" && !!listing?.id && caps.canMiniSite;

  const isDeleted = !!business.deleted_at;

  async function doSoftDelete() {
    startTransition(async () => {
      const res = await softDeleteBusinessAction(lang, business.id, deleteNote);
      if (!res.ok) {
        toast({ title: "Fout", description: res.error, variant: "destructive" });
        return;
      }
      toast({ title: "Verwijderd", description: "Bedrijf is soft-deleted." });
      router.refresh();
      setDeleteNote("");
    });
  }

  async function doUndoDelete() {
    startTransition(async () => {
      const res = await undoDeleteBusinessAction(lang, business.id, undoNote);
      if (!res.ok) {
        toast({ title: "Fout", description: res.error, variant: "destructive" });
        return;
      }
      toast({ title: "Hersteld", description: "Bedrijf is hersteld." });
      router.refresh();
      setUndoNote("");
    });
  }

  if (loading) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{lang === "nl" ? "Laden…" : "Loading…"}</span>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{businessName}</span>
          <span>•</span>
          <span className="capitalize">{island}</span>

          <span className="ms-2" />

          <Badge variant={plan === "pro" ? "default" : "secondary"} className="capitalize">
            {plan}
          </Badge>
          <Badge variant={status === "active" ? "default" : "secondary"} className="capitalize">
            {status}
          </Badge>

          {isAdmin ? (
            <Badge variant="default">super_admin</Badge>
          ) : null}

          {isDeleted ? (
            <Badge variant="destructive">{lang === "nl" ? "verwijderd" : "deleted"}</Badge>
          ) : null}
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-md border border-red-500/40 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {!listing && (
          <div className="mt-4 rounded-md border border-amber-500/40 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {lang === "nl"
              ? "Nog geen listing gevonden. Rond eerst je aanmaak-flow af (check business_listings.business_id)."
              : "No listing found yet. Finish your create flow (check business_listings.business_id)."}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profiel */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {lang === "nl" ? "Profiel" : "Profile"}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {lang === "nl"
                  ? "Beheer je bedrijfsgegevens, contact en beschrijving."
                  : "Manage your business details, contact and description."}
              </p>
            </div>
          </CardHeader>

          <CardContent className="pt-2 space-y-3">
            <Button
              variant="hero"
              className="w-full"
              disabled={!business?.id || isDeleted}
              onClick={() => router.push(langHref(lang, `/business/edit/${business.id}`))}
            >
              <Pencil className="mr-2 h-4 w-4" />
              {lang === "nl" ? "Profiel bewerken" : "Edit profile"}
            </Button>

            {/* ✅ Verwijderen / Herstellen */}
            {!isDeleted ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={pending}
                  >
                    {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    {lang === "nl" ? "Bedrijf verwijderen" : "Delete business"}
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {lang === "nl" ? "Bedrijf verwijderen?" : "Delete business?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {lang === "nl"
                        ? "Dit is een soft-delete: je data blijft bestaan, maar is niet meer zichtbaar in de flow."
                        : "This is a soft-delete: your data remains, but it is hidden from the flow."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <div className="mt-4 space-y-2">
                    <label className="text-sm font-medium">
                      {lang === "nl" ? "Reden (optioneel)" : "Reason (optional)"}
                    </label>
                    <Textarea
                      value={deleteNote}
                      onChange={(e) => setDeleteNote(e.target.value)}
                      placeholder={lang === "nl" ? "Bijv. duplicaat / test…" : "e.g. duplicate / test…"}
                    />
                    {isAdmin ? (
                      <p className="text-xs text-muted-foreground">
                        {lang === "nl"
                          ? "Je bent super_admin: dit wordt gelogd in audit."
                          : "You are super_admin: this will be logged to audit."}
                      </p>
                    ) : null}
                  </div>

                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={pending}>
                      {lang === "nl" ? "Annuleren" : "Cancel"}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={doSoftDelete}
                      disabled={pending}
                      className="bg-destructive text-destructive-foreground hover:opacity-90"
                    >
                      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {lang === "nl" ? "Verwijderen" : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full" disabled={pending}>
                    {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                    {lang === "nl" ? "Bedrijf herstellen" : "Restore business"}
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {lang === "nl" ? "Bedrijf herstellen?" : "Restore business?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {lang === "nl"
                        ? "Dit zet deleted_at terug naar null voor business + listing(s)."
                        : "This sets deleted_at back to null for business + listing(s)."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <div className="mt-4 space-y-2">
                    <label className="text-sm font-medium">
                      {lang === "nl" ? "Reden (optioneel)" : "Reason (optional)"}
                    </label>
                    <Textarea
                      value={undoNote}
                      onChange={(e) => setUndoNote(e.target.value)}
                      placeholder={lang === "nl" ? "Bijv. per ongeluk verwijderd…" : "e.g. removed by mistake…"}
                    />
                  </div>

                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={pending}>
                      {lang === "nl" ? "Annuleren" : "Cancel"}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={doUndoDelete} disabled={pending}>
                      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {lang === "nl" ? "Herstellen" : "Restore"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardContent>
        </Card>

        {/* Mini-site */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Mini-site
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {lang === "nl"
                ? "Mini-site is alleen beschikbaar als je plan dit toelaat."
                : "Mini-site is available only if your plan allows it."}
            </p>
          </CardHeader>

          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              disabled={!showOpenMiniSite || !listing?.id || isDeleted}
              onClick={() => {
                if (!listing?.id) return;
                window.open(langHref(lang, `/biz/${listing.id}`), "_blank");
              }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {lang === "nl" ? "Open mini-site" : "Open mini-site"}
            </Button>

            {!caps.canMiniSite ? (
              <Button
                variant="hero"
                className="w-full"
                disabled={isDeleted}
                onClick={() => router.push(langHref(lang, "/business/offers"))}
              >
                <Lock className="mr-2 h-4 w-4" />
                {lang === "nl" ? "Upgrade naar PRO" : "Upgrade to PRO"}
              </Button>
            ) : null}

            <p className="text-xs text-muted-foreground">
              {lang === "nl"
                ? "Mini-site wordt pas publiek bij status active."
                : "Mini-site becomes public only when status is active."}
            </p>
          </CardContent>
        </Card>

        {/* Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Limits
            </CardTitle>
          </CardHeader>

          <CardContent className="text-sm text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>{lang === "nl" ? "Max categorieën" : "Max categories"}</span>
              <span className="text-foreground">{caps.maxCategories}</span>
            </div>
            <div className="flex justify-between">
              <span>{lang === "nl" ? "Max locaties" : "Max locations"}</span>
              <span className="text-foreground">{caps.maxLocations}</span>
            </div>
            <div className="flex justify-between">
              <span>{lang === "nl" ? "Max deals" : "Max deals"}</span>
              <span className="text-foreground">{caps.maxDeals}</span>
            </div>
            <div className="flex justify-between">
              <span>{lang === "nl" ? "Max foto’s" : "Max photos"}</span>
              <span className="text-foreground">{caps.maxPhotos}</span>
            </div>
            <div className="flex justify-between">
              <span>{lang === "nl" ? "Max video’s" : "Max videos"}</span>
              <span className="text-foreground">{caps.maxVideos}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}