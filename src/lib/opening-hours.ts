// src/lib/opening-hours.ts

export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export const DAY_ORDER: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export type OpeningHoursEntry = {
  closed: boolean;
  from: string; // "09:00"
  to: string;   // "18:00"
};

export type OpeningHoursJSON = Record<DayKey, OpeningHoursEntry>;

/* ---------- Labels per taal ---------- */

const LABELS_NL: Record<DayKey, string> = {
  monday: "Maandag",
  tuesday: "Dinsdag",
  wednesday: "Woensdag",
  thursday: "Donderdag",
  friday: "Vrijdag",
  saturday: "Zaterdag",
  sunday: "Zondag",
};

const LABELS_EN: Record<DayKey, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const LABELS_ES: Record<DayKey, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

const LABELS_PAP: Record<DayKey, string> = {
  monday: "Djaluna",
  tuesday: "Djamars",
  wednesday: "Djarason",
  thursday: "Djaweps",
  friday: "Djabierne",
  saturday: "Djasabra",
  sunday: "Djadumingu",
};

export function getDayLabels(
  locale: "nl" | "en" | "es" | "pap"
): Record<DayKey, string> {
  switch (locale) {
    case "nl":
      return LABELS_NL;
    case "es":
      return LABELS_ES;
    case "pap":
      return LABELS_PAP;
    default:
      return LABELS_EN;
  }
}

/* ---------- Normaliseren ---------- */

export function normalizeOpeningHours(json: OpeningHoursJSON): OpeningHoursJSON {
  const fixed: OpeningHoursJSON = {} as OpeningHoursJSON;

  DAY_ORDER.forEach((day) => {
    const entry = json[day];
    if (!entry) {
      fixed[day] = { closed: true, from: "09:00", to: "18:00" };
      return;
    }

    fixed[day] = {
      closed: !!entry.closed,
      from: entry.from && entry.from.trim() !== "" ? entry.from : "09:00",
      to: entry.to && entry.to.trim() !== "" ? entry.to : "18:00",
    };
  });

  return fixed;
}

/* ---------- Legacy text parser (oude formaat blijft werken) ---------- */

export type OpeningLine = {
  day: string;
  closed: boolean;
  from: string;
  to: string;
};

/**
 * Leest opening_hours:
 * - als JSON (nieuw formaat OpeningHoursField)
 * - of valt terug op oude tekstnotatie ("Maandag: 09:00 - 18:00")
 */
export function getOpeningLines(
  raw: string | null,
  locale: "nl" | "en" | "es" | "pap"
): OpeningLine[] {
  if (!raw || !raw.trim()) return [];

  const trimmed = raw.trim();

  // 1) Probeer JSON (nieuw formaat)
  if (trimmed.startsWith("{")) {
    try {
      const json = JSON.parse(trimmed) as OpeningHoursJSON;
      const labels = getDayLabels(locale);

      const lines: OpeningLine[] = [];
      DAY_ORDER.forEach((day) => {
        const entry = json[day];
        if (!entry) return;

        lines.push({
          day: labels[day],
          closed: !!entry.closed,
          from: entry.from ?? "09:00",
          to: entry.to ?? "18:00",
        });
      });

      if (lines.length > 0) return lines;
    } catch {
      // JSON stuk → fallback naar legacy
    }
  }

  // 2) Fallback: oude tekstformaat
  return parseLegacyOpeningText(trimmed);
}

// heel simpele legacy parser - laat jouw bestaande implementatie
// hier staan als je die al had; hieronder een veilige versie:
function parseLegacyOpeningText(text: string): OpeningLine[] {
  const lines: OpeningLine[] = [];

  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line) => {
      const [dayPart, restPartRaw] = line.split(":");
      const day = (dayPart ?? "").trim() || "?";
      const restPart = (restPartRaw ?? "").trim().toLowerCase();

      if (!restPart) return;

      const isClosed = ["gesloten", "closed", "cerrado", "será"].some((w) =>
        restPart.includes(w)
      );

      if (isClosed) {
        lines.push({
          day,
          closed: true,
          from: "",
          to: "",
        });
        return;
      }

      const match = restPart.match(/(\d{1,2}:\d{2}).*?(\d{1,2}:\d{2})/);
      if (!match) {
        lines.push({
          day,
          closed: false,
          from: "",
          to: "",
        });
        return;
      }

      lines.push({
        day,
        closed: false,
        from: match[1],
        to: match[2],
      });
    });

  return lines;
}

/* ---------- Nieuwe helpers voor Field <-> DB ---------- */

/** Parse string uit DB (JSON of legacy tekst) naar OpeningHoursJSON */
export function parseOpeningHours(raw: string | null): OpeningHoursJSON {
  // als het op JSON lijkt
  if (raw && raw.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(raw) as OpeningHoursJSON;
      return normalizeOpeningHours(parsed);
    } catch {
      // val terug op defaults
    }
  }

  // als tekst → eerst naar OpeningLine[], daarna mappen naar JSON
  const lines = getOpeningLines(raw, "nl"); // labels zijn hier niet zo belangrijk
  const base: any = {};

  DAY_ORDER.forEach((day) => {
    base[day] = {
      closed: true,
      from: "09:00",
      to: "18:00",
    };
  });

  lines.forEach((line, index) => {
    const day = DAY_ORDER[index];
    if (!day) return;

    base[day] = {
      closed: line.closed,
      from: line.from || "09:00",
      to: line.to || "18:00",
    };
  });

  return base as OpeningHoursJSON;
}

/** Serialize OpeningHoursJSON naar string voor opslag in DB */
export function stringifyOpeningHours(json: OpeningHoursJSON): string {
  const normalized = normalizeOpeningHours(json);
  return JSON.stringify(normalized);
}