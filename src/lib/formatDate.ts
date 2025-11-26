// src/lib/formatDate.ts
export function formatDate(iso?: string) {
  if (!iso) return "";

  try {
    const d = new Date(iso);

    // Vast formaat, vaste locale → geen hydration gedoe
    return new Intl.DateTimeFormat("nl-NL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    return iso ?? "";
  }
}