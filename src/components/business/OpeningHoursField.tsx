"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n/config";

type Props = {
  lang: Locale;
  value: string;                 // tekst zoals in DB (multi-line)
  onChange: (value: string) => void; // nieuwe multi-line tekst
};

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
  from: string; // "09:00"
  to: string;   // "18:00"
};

/* -------------------------- Labels per taal -------------------------- */

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
    thursday: "Djaweps",
    friday: "Djabièrnè",
    saturday: "Djasabra",
    sunday: "Djadumingu",
  },
};

/* -------------------------- Helpers -------------------------- */

const DEFAULT_ROWS: Row[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
].map((day) => ({
  day: day as DayKey,
  closed: false,
  from: "09:00",
  to: "18:00",
}));

function rowsToText(rows: Row[], lang: Locale): string {
  const labels = DAY_LABELS[lang] ?? DAY_LABELS.nl;

  return rows
    .map((r) => {
      const label = labels[r.day];
      if (r.closed) {
        switch (lang) {
          case "nl":
            return `${label}: Gesloten`;
          case "es":
            return `${label}: Cerrado`;
          case "pap":
            return `${label}: Será`;
          default:
            return `${label}: Closed`;
        }
      }
      return `${label}: ${r.from} - ${r.to}`;
    })
    .join("\n");
}

function parseInitial(value: string, lang: Locale): Row[] {
  if (!value || value.trim().length < 3) return DEFAULT_ROWS;

  const labels = DAY_LABELS[lang] ?? DAY_LABELS.nl;
  const labelToDay: Partial<Record<string, DayKey>> = {};

  (Object.keys(labels) as DayKey[]).forEach((day) => {
    labelToDay[labels[day].toLowerCase()] = day;
  });

  const base = [...DEFAULT_ROWS];
  const lines = value.split("\n").map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    const [labelPart, restRaw] = line.split(":");
    if (!restRaw) continue;

    const labelKey = labelPart.trim().toLowerCase();
    const day = labelToDay[labelKey];
    if (!day) continue;

    const rest = restRaw.trim();

    if (/gesloten|closed|cerrado|será/i.test(rest)) {
      const row = base.find((r) => r.day === day);
      if (row) {
        row.closed = true;
        row.from = "";
        row.to = "";
      }
      continue;
    }

    const match = rest.match(/(\d{2}:\d{2}).+(\d{2}:\d{2})/);
    if (!match) continue;

    const row = base.find((r) => r.day === day);
    if (row) {
      row.closed = false;
      row.from = match[1];
      row.to = match[2];
    }
  }

  return base;
}

/* -------------------------- Component -------------------------- */

export default function OpeningHoursField({ lang, value, onChange }: Props) {
  const [rows, setRows] = useState<Row[]>(() => parseInitial(value, lang));

  const labels = DAY_LABELS[lang] ?? DAY_LABELS.nl;

  function updateRow(day: DayKey, patch: Partial<Row>) {
    setRows((prev) => {
      const next = prev.map((r) =>
        r.day === day ? { ...r, ...patch } : r
      );
      const text = rowsToText(next, lang);
      onChange(text); // ⬅️ GEEN useEffect, dus geen infinite loop
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {(rows as Row[]).map((row) => (
        <div
          key={row.day}
          className="grid grid-cols-[minmax(120px,1fr)_auto_auto_auto] items-center gap-3 text-sm"
        >
          <div className="font-medium">{labels[row.day]}</div>

          <div className="flex items-center gap-1 text-xs">
            <input
              id={`closed-${row.day}`}
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              checked={row.closed}
              onChange={(e) =>
                updateRow(row.day, {
                  closed: e.target.checked,
                  from: e.target.checked ? "" : row.from || "09:00",
                  to: e.target.checked ? "" : row.to || "18:00",
                })
              }
            />
            <Label
              htmlFor={`closed-${row.day}`}
              className="cursor-pointer select-none text-muted-foreground"
            >
              {lang === "nl"
                ? "Gesloten"
                : lang === "es"
                ? "Cerrado"
                : lang === "pap"
                ? "Será"
                : "Closed"}
            </Label>
          </div>

          <Input
            type="time"
            className="h-8"
            disabled={row.closed}
            value={row.from}
            onChange={(e) =>
              updateRow(row.day, { from: e.target.value, closed: false })
            }
          />

          <span className="text-center">–</span>

          <Input
            type="time"
            className="h-8"
            disabled={row.closed}
            value={row.to}
            onChange={(e) =>
              updateRow(row.day, { to: e.target.value, closed: false })
            }
          />
        </div>
      ))}
    </div>
  );
}