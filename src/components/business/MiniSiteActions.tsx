"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Phone, MessageCircle, Mail } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { trackClick } from "@/lib/track/trackClick";

type EventType = "route" | "call" | "whatsapp" | "website";

type Props = {
  lang: Locale;
  businessId: string;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  routeUrl?: string | null;
  className?: string;
};

function clean(s?: string | null) {
  return (s ?? "").trim();
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

function toWhatsAppHref(whatsapp?: string | null) {
  const w = clean(whatsapp);
  if (!w) return "";

  // accepteer: "https://wa.me/..", "+599...", "061234..."
  if (w.startsWith("http://") || w.startsWith("https://")) return w;

  const digits = w.replace(/(?!^\+)[^\d]/g, "");
  const normalized = digits.startsWith("+") ? digits.slice(1) : digits;
  return normalized ? `https://wa.me/${normalized}` : "";
}

function normalizeRouteUrl(routeUrl?: string | null) {
  const r = clean(routeUrl);
  if (!r) return "";
  // als het al een url is, gebruik die
  if (r.startsWith("http://") || r.startsWith("https://")) return r;

  // anders: maak er een Google Maps query van
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r)}`;
}

export default function MiniSiteActions({
  lang,
  businessId,
  phone,
  whatsapp,
  email,
  routeUrl,
  className,
}: Props) {
  const pathname = usePathname() ?? "/";

  const waHref = toWhatsAppHref(whatsapp);
  const telHref = toTelHref(phone);
  const mailHref = toMailHref(email);
  const routeHref = normalizeRouteUrl(routeUrl);

  const labels = {
    route: lang === "nl" ? "Route" : "Route",
    call: lang === "nl" ? "Bel" : "Call",
    whatsapp: "WhatsApp",
    email: lang === "nl" ? "Mail" : "Email",
  } as const;

  const fire = (eventType: EventType) => {
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

  const softBtn =
    baseBtn +
    " border border-border bg-background/75 backdrop-blur " +
    "shadow-[0_6px_18px_rgba(0,0,0,0.18)] hover:shadow-[0_10px_22px_rgba(0,0,0,0.24)] " +
    "hover:bg-muted";

  const waBtn =
    baseBtn +
    " bg-primary text-white shadow-[0_8px_22px_rgba(0,191,211,0.30)] " +
    "hover:shadow-[0_12px_28px_rgba(0,191,211,0.38)]";

  const mailBtn = baseBtn + " button-gradient";

  return (
    <div className={className ?? "flex flex-wrap items-center gap-3"}>
      {routeHref && (
        <Link
          href={routeHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => fire("route")}
          className={softBtn}
          aria-label={labels.route}
        >
          <MapPin className="h-4 w-4" />
          {labels.route}
        </Link>
      )}

      {telHref && (
        <Link
          href={telHref}
          onClick={() => fire("call")}
          className={softBtn}
          aria-label={labels.call}
        >
          <Phone className="h-4 w-4" />
          {labels.call}
        </Link>
      )}

      {waHref && (
        <Link
          href={waHref}
          rel="noopener noreferrer"
          onClick={() => fire("whatsapp")}
          className={waBtn}
          aria-label={labels.whatsapp}
        >
          <MessageCircle className="h-4 w-4" />
          {labels.whatsapp}
        </Link>
      )}

      {mailHref && (
        <Link
          href={mailHref}
          onClick={() => fire("website")}
          className={softBtn}
        >
          <Mail className="h-4 w-4" />
          {labels.email}
        </Link>
      )}
    </div>
  );
}