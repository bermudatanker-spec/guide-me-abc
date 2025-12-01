"use client";

import * as React from "react";
import {
  DAY_ORDER,
  type DayKey,
  type OpeningHoursJSON,
  getDayLabels,
} from "@/lib/opening-hours";

type Props = {
  locale: "nl" | "en" | "pap" | "es";
  defaultValue?: OpeningHoursJSON | null;
  onChange: (value: OpeningHoursJSON) => void;
};

export function OpeningHoursEditor({ locale, defaultValue, onChange }: Props) {
  const labels = getDayLabels(locale);

  // Startwaarde: bestaande waarde uit DB of defaults
  const [value, setValue] = React.useState<OpeningHoursJSON>(() => {
    const base: any = {};
    DAY_ORDER.forEach((day) => {
      const fromDefault = defaultValue?.[day];
      base[day] =
        fromDefault ?? {
          closed: false,
          from: "09:00",
          to: "18:00",
        };
    });
    return base as OpeningHoursJSON;
  });

  // SYNC MET DEFAULTVALUE – MAAR ALLEEN ALS DE INHOUD VERANDERD IS
React.useEffect(() => {
  if (!defaultValue) return;

  // 1) maak normalized versies voor vergelijk
  const incoming = JSON.stringify(defaultValue);
  const current = JSON.stringify(value);

  // 2) als ze hetzelfde zijn → NIET updaten (anders loop)
  if (incoming === current) return;

  // 3) anders werkelijk syncen
  setValue(() => {
    const next: any = {};
    DAY_ORDER.forEach((day) => {
      next[day] = defaultValue[day] ?? {
        closed: false,
        from: "09:00",
        to: "18:00",
      };
    });
    return next as OpeningHoursJSON;
  });
}, [defaultValue]);

  // Elke wijziging doorgeven aan parent (OpeningHoursField)
  React.useEffect(() => {
    onChange(value);
  }, [value, onChange]);

  function updateDay(
    day: DayKey,
    updater: (prev: OpeningHoursJSON[DayKey]) => OpeningHoursJSON[DayKey]
  ) {
    setValue((prev) => ({
      ...prev,
      [day]: updater(prev[day]),
    }));
  }

  return (
    <div className="space-y-2 rounded-md border border-border bg-muted/40 p-3">
      {DAY_ORDER.map((day) => {
        const entry = value[day];

        return (
          <div
            key={day}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <div className="w-28 font-medium">{labels[day]}</div>

            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={entry.closed}
                onChange={(e) =>
                  updateDay(day, (prev) => ({
                    ...prev,
                    closed: e.target.checked,
                  }))
                }
              />
              {locale === "nl" ? "Gesloten" : "Closed"}
            </label>

            {!entry.closed && (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  className="h-8 rounded-md border border-border bg-background px-2 text-xs"
                  value={entry.from}
                  onChange={(e) =>
                    updateDay(day, (prev) => ({
                      ...prev,
                      from: e.target.value,
                    }))
                  }
                />
                <span>–</span>
                <input
                  type="time"
                  className="h-8 rounded-md border border-border bg-background px-2 text-xs"
                  value={entry.to}
                  onChange={(e) =>
                    updateDay(day, (prev) => ({
                      ...prev,
                      to: e.target.value,
                    }))
                  }
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}