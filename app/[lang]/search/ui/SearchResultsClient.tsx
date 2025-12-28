"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type Island = "all" | "aruba" | "bonaire" | "curacao";

type Props = {
  lang: Locale;
  q: string;
  island: Island;
};

type BusinessRow = {
  id: string;
  business_name: string | null;
  description: string | null;
  island: string | null;
};

function normalizeTerm(input: string) {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

function escapeForIlike(input: string) {
  return input.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function isIslandWord(term: string): term is Exclude<Island, "all"> {
  return term === "aruba" || term === "bonaire" || term === "curacao";
}

export default function SearchResultsClient({ lang, q, island }: Props) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const { toast } = useToast();

  const [rows, setRows] = useState<BusinessRow[]>([]);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef<number | null>(null);
  const latestReqRef = useRef(0);

  useEffect(() => {
    const term = normalizeTerm(q ?? "");

    if (term.length < 2) {
      setRows([]);
      setLoading(false);
      return;
    }

    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(async () => {
      const reqId = ++latestReqRef.current;
      setLoading(true);

      try {
        let query = supabase
          .from("business_listings")
          .select("id,business_name,description,island, is_verified, verified_at")
          .limit(30);

        if (isIslandWord(term)) {
          query = query.eq("island", term);
        } else {
          const safe = escapeForIlike(term);
          query = query.or(
            `business_name.ilike.%${safe}%,description.ilike.%${safe}%`
          );

          if (island !== "all") {
            query = query.eq("island", island);
          }
        }

        const { data, error } = await query;

        if (reqId !== latestReqRef.current) return;
        if (error) throw error;

        setRows((data ?? []) as BusinessRow[]);
      } catch (err: any) {
        if (reqId !== latestReqRef.current) return;

        console.error("[search] error", err);
        setRows([]);

        toast({
          title: lang === "nl" ? "Zoeken mislukt" : "Search failed",
          description: err?.message ?? "Unknown error",
          variant: "destructive",
        });
      } finally {
        if (reqId === latestReqRef.current) setLoading(false);
      }
    }, 220);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [q, island, supabase, toast, lang]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {lang === "nl" ? "Zoeken…" : "Searching…"}
      </div>
    );
  }

  if (!rows.length) {
    return (
      <p className="text-sm text-muted-foreground">
        {lang === "nl" ? "Geen resultaten." : "No results."}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((b) => (
        <Link
          key={b.id}
          href={`/${lang}/business/${b.id}`}
          className="block rounded-xl border border-border/60 bg-card p-4 hover:bg-card/80 transition"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate font-medium">{b.business_name ?? "—"}</div>
              {b.description ? (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {b.description}
                </p>
              ) : null}
            </div>

            <span className="shrink-0 rounded-full border px-2 py-1 text-xs text-muted-foreground">
              {b.island ?? "—"}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}