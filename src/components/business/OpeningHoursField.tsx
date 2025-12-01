"use client";

import * as React from "react";
import type { Locale } from "@/i18n/config";
import {
  parseOpeningHours,
  stringifyOpeningHours,
  type OpeningHoursJSON,
} from "@/lib/opening-hours";
import { OpeningHoursEditor } from "@/components/dashboard/OpeningHoursEditor";

type Props = {
  lang: Locale;
  value: string | null;              // string uit DB
  onChange: (value: string) => void; // string terug naar formulier
};

export default function OpeningHoursField({ lang, value, onChange }: Props) {
  // JSON state intern in dit veld
  const [json, setJson] = React.useState<OpeningHoursJSON>(() =>
    parseOpeningHours(value ?? "")
  );

  // Als de string van buiten wijzigt (bijv. ander bedrijf / reset), syncen
  React.useEffect(() => {
    setJson(parseOpeningHours(value ?? ""));
  }, [value]);

  const lastSerializedRef = React.useRef<string | null>(null);

  function handleEditorChange(next: OpeningHoursJSON) {
    // update eigen JSON state
    setJson(next);

    // serialize naar string voor form / Supabase
    const serialized = stringifyOpeningHours(next);
    if (serialized === lastSerializedRef.current) return;
    lastSerializedRef.current = serialized;

    onChange(serialized);
  }

  const localeShort: "nl" | "en" | "es" | "pap" =
    lang === "nl" || lang === "en" || lang === "es" || lang === "pap"
      ? lang
      : "en";

  return (
    <div className="space-y-2">
      <OpeningHoursEditor
        locale={localeShort}
        defaultValue={json}
        onChange={handleEditorChange}
      />

      <p className="text-[11px] text-muted-foreground">
        {localeShort === "nl"
          ? "Gebruik 24-uurs tijden (bijv. 09:00 en 18:00). Vink 'Gesloten' aan als je dicht bent."
          : "Use 24h times (e.g. 09:00 and 18:00). Mark days as closed when you're not open."}
      </p>
    </div>
  );
}