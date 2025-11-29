// src/components/business/OpeningHoursField.tsx
"use client";

import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n/config";

type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

type Row = {
  day: DayKey;
  closed: boolean;
  from: string;
  to: string;
};

type Props = {
  /** Mag worden doorgegeven; als hij ontbreekt pakken we de lang uit de URL */
  lang?: Locale;
  value: string;              // multi-line tekst uit/naar DB
  onChange: (value: string) => void;
};

/* ----------------------------- Labels ----------------------------- */

const DAY_LABELS: Record<Locale, Record<DayKey, string>> = {
  nl: {
    monday: "Maandag",
    tuesday: "Dinsdag",
    wednesday: "Woensdag",
    thursday: "Donderdag",
    friday: "Vrijdag",
    saturday: "Zaterdag",
    sunday: "Zondag",
  },
  en: {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  },
  es: {
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo",
  },
  pap: {
    monday: "Djaluna",
    tuesday: "Djamars",
    wednesday: "Djarason",
    thursday: "Djawebs",
    friday: "Djabierne",
    saturday: "Djasabra",
    sunday: "Djadumingu",
  },
};

const CLOSED_LABEL: Record<Locale, string> = {
  nl: "Gesloten",
  en: "Closed",
  es: "Cerrado",
  pap: "Serrá",
};

/* ----------------------------- Defaults ----------------------------- */

const DEFAULT_ROWS: Row[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
].map((d) => ({
  day: d as DayKey,
  closed: false,
  from: "09:00",
  to: "18:00",
}));

/* ------------------------- text → rows ------------------------- */

function textToRows(value: string, lang: Locale): Row[] {
  const labels = DAY_LABELS[lang] ?? DAY_LABELS.nl;

  if (!value?.trim()) return DEFAULT_ROWS;

  const lines = value.split("\n");

  return DEFAULT_ROWS.map((base) => {
    const label = labels[base.day];
    const line =
      lines.find((l) =>
        l.toLowerCase().startsWith(label.toLowerCase()),
      ) ?? "";

    if (!line) return base;

    const lower = line.toLowerCase();
    if (
      lower.includes("gesloten") ||
      lower.includes("closed") ||
      lower.includes("cerrado") ||
      lower.includes("serrá")
    ) {
      return { ...base, closed: true, from: "", to: "" };
    }

    const m = line.match(/(\d{2}:\d{2}).+?(\d{2}:\d{2})/);
    if (!m) return base;

    return {
      ...base,
      closed: false,
      from: m[1],
      to: m[2],
    };
  });
}

/* ------------------------- rows → text ------------------------- */

function rowsToText(rows: Row[], lang: Locale): string {
  const labels = DAY_LABELS[lang] ?? DAY_LABELS.nl;
  const closed = CLOSED_LABEL[lang] ?? CLOSED_LABEL.nl;

  return rows
    .map((r) =>
      r.closed
        ? `${labels[r.day]}: ${closed}`
        : `${labels[r.day]}: ${r.from} - ${r.to}`,
    )
    .join("\n");
}

/* ----------------------------- Component ----------------------------- */

export default function OpeningHoursField({ lang, value, onChange }: Props) {
  // 1) taal uit URL proberen
  const params = useParams() as { lang?: string } | null;
  const routeLang = (params?.lang as Locale | undefined) ?? undefined;

  // 2) volgorde: prop → URL → "nl"
  const effectiveLang: Locale = lang ?? routeLang ?? "nl";

  // Geen lokale state meer: we berekenen rows puur uit `value`
  const rows = textToRows(value, effectiveLang);

  const labels = DAY_LABELS[effectiveLang] ?? DAY_LABELS.nl;
  const closedText = CLOSED_LABEL[effectiveLang] ?? CLOSED_LABEL.nl;

  function updateRow(index: number, patch: Partial<Row>) {
    const nextRows = rows.map((row, i) => {
      if (i !== index) return row;
      const merged: Row = { ...row, ...patch };

      if (patch.closed) {
        merged.from = "";
        merged.to = "";
      }

      return merged;
    });

    const text = rowsToText(nextRows, effectiveLang);
    onChange(text); // 🔥 enige plek waar we de parent updaten
  }

  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div
          key={row.day}
          className="grid grid-cols-[minmax(0,1.5fr)_auto_auto_auto] items-center gap-3 text-sm"
        >
          <span className="font-medium">{labels[row.day]}</span>

          <label className="flex items-center gap-1 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={row.closed}
              onChange={(e) =>
                updateRow(index, { closed: e.target.checked })
              }
              className="h-4 w-4 rounded border-border"
            />
            {closedText}
          </label>

          <Input
            type="time"
            value={row.from}
            disabled={row.closed}
            onChange={(e) => updateRow(index, { from: e.target.value })}
            className="h-8"
          />

          <Input
            type="time"
            value={row.to}
            disabled={row.closed}
            onChange={(e) => updateRow(index, { to: e.target.value })}
            className="h-8"
          />
        </div>
      ))}
    </div>
  );
}