"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Phone, MessageCircle, Mail } from "lucide-react";
import type { Locale } from "@/i18n/config";

import { trackClick } from "@/lib/track/trackClick";

/**
 * Haal het eventType-type direct uit trackClick args.
 * => NOOIT meer rode kronkels door verkeerde import/export.
 */
type ClickEventType = Parameters<typeof trackClick>[0]["eventType"];

type Props = {
  lang: Locale;
  businessId: string;

  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  routeUrl?: string | null;

  className?: string;

  /**
   * Alleen voor ROUTE (Maps).
   * Default: true (route opent nieuw tabblad).
   * Bel/WhatsApp/Mail blijven altijd same-tab.
   */
  openRouteInNewTab?: boolean;
};

/* ---------------- Helpers ---------------- */

function clean(v?: string | null) {
  return (v ?? "").trim();
}

function toTelHref(phone?: string | null) {
  const p = clean(phone).replace(/\s+/g, "");
  if (!p) return "";
  // laat + staan, verwijder overige rommel
  const normalized = p.replace(/(?!^\+)[^\d]/g, "");
  return normalized ? `tel:${normalized}` : "";
}

function toMailHref(email?: string | null) {
  const e = clean(email);
  if (!e) return "";
  return `mailto:${e}`;
}

function toWhatsAppHref(wa?: string | null) {
  const w = clean(wa);
  if (!w) return "";
  // accepteer +, cijfers, spaties, streepjes etc.
  const normalized = w.replace(/\s+/g, "").replace(/(?!^\+)[^\d]/g, "");
  const digits = normalized.replace(/^\+/, "");
  if (!digits) return "";
  return `https://wa.me/${digits}`;
}

function normalizeRouteUrl(routeUrl?: string | null) {
  const r = clean(routeUrl);
  if (!r) return "";
  // als user al https://... geeft, laat zo
  if (/^https?:\/\//i.test(r)) return r;
  // google maps link zonder protocol
  if (/^www\./i.test(r)) return `https://${r}`;
  // fallback: beschouw als url
  return `https://${r}`;
}

/* ---------------- Component ---------------- */

export default function MiniSiteActions({
  lang,
  businessId,
  phone,
  whatsapp,
  email,
  routeUrl,
  className,
  openRouteInNewTab = true,
}: Props) {
  const pathname = usePathname() ?? "/";

  const telHref = toTelHref(phone);
  const waHref = toWhatsAppHref(whatsapp);
  const mailHref = toMailHref(email);
  const routeHref = normalizeRouteUrl(routeUrl);

  const labels = {
    route: lang === "nl" ? "Route" : "Route",
    call: lang === "nl" ? "Bel" : "Call",
    whatsapp: "WhatsApp",
    email: lang === "nl" ? "Mail" : "Email",
  } as const;

  const fire = (eventType: ClickEventType) => {
    // fire-and-forget, UX nooit blokkeren
    void trackClick({
      businessId,
      eventType,
      path: pathname,
      lang,
    });
  };

  const baseBtn =
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold " +
    "transition-all hover:opacity-95 focus-visible:outline-none";

  // Soft pills (route + bel) met donkerdere schaduw
  const softBtn =
    baseBtn +
    " border border-border bg-background/75 backdrop-blur " +
    "shadow-[0_6px_18px_rgba(0,0,0,0.18)] hover:shadow-[0_10px_22px_rgba(0,0,0,0.26)]";

  // WhatsApp turquoise-ish (sluit aan bij jouw primary)
  const waBtn =
    baseBtn +
    " bg-primary text-white shadow-[0_10px_26px_rgba(0,191,211,0.30)] " +
    "hover:shadow-[0_14px_32px_rgba(0,191,211,0.38)]";

  // Mail coral uit globals (button-gradient = koraal default)
  const mailBtn =
    baseBtn +
    " button-gradient"; // gebruikt jouw globals.css

  return (
    <div className={className ?? "flex flex-wrap items-center gap-3"}>
      {/* ROUTE (optioneel nieuw tabblad) */}
      {routeHref ? (
        <a
          href={routeHref}
          target={openRouteInNewTab ? "_blank" : undefined}
          rel={openRouteInNewTab ? "noopener noreferrer" : undefined}
          onClick={() => fire("route")}
          className={softBtn}
          aria-label={labels.route}
        >
          <MapPin className="h-5 w-5" />
          {labels.route}
        </a>
      ) : null}

      {/* BEL (altijd same-tab) */}
      {telHref ? (
        <a
          href={telHref}
          onClick={() => fire("call")}
          className={softBtn}
          aria-label={labels.call}
        >
          <Phone className="h-5 w-5" />
          {labels.call}: {clean(phone)}
        </a>
      ) : null}

      {/* WHATSAPP (altijd same-tab) */}
      {waHref ? (
        <a
          href={waHref}
          onClick={() => fire("whatsapp")}
          className={waBtn}
          aria-label={labels.whatsapp}
        >
          <MessageCircle className="h-5 w-5" />
          {labels.whatsapp}
        </a>
      ) : null}

      {/* MAIL (altijd same-tab) */}
      {mailHref ? (
        <a
          href={mailHref}
          onClick={() => fire("website" as ClickEventType)}
          className={mailBtn}
          aria-label={labels.email}
        >
          <Mail className="h-5 w-5" />
          {labels.email}
        </a>
      ) : null}
    </div>
  );
}