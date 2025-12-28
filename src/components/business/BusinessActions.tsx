"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { trackClick } from "@/lib/track/trackClick";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, Globe, MapPin } from "lucide-react";
import type { Locale } from "@/i18n/config";

type Props = {
  businessId: string;
  lang: Locale;
  island?: string | null;

  whatsapp?: string | null; // mag al "https://wa.me/..." zijn OF telefoonnummer
  phone?: string | null; // tel:+...
  website?: string | null; // https://...
  mapsUrl?: string | null; // https://maps.google.com...
  className?: string;
};

function normalizeUrl(url?: string | null) {
  if (!url) return null;
  const v = url.trim();
  if (!v) return null;
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `https://${v}`;
}

function normalizeWhatsApp(value?: string | null) {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;

  // Als het al een wa.me link is, klaar
  if (v.includes("wa.me") || v.includes("whatsapp.com")) return v;

  // Anders: probeer telefoonnummer te strippen -> https://wa.me/<digits>
  const digits = v.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

function normalizeTel(value?: string | null) {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;
  if (v.startsWith("tel:")) return v;
  const digits = v.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
}

export default function BusinessActions({
  businessId,
  lang,
  island,
  whatsapp,
  phone,
  website,
  mapsUrl,
  className,
}: Props) {
  const pathname = usePathname();

  const waHref = normalizeWhatsApp(whatsapp);
  const telHref = normalizeTel(phone);
  const webHref = normalizeUrl(website);
  const mapHref = normalizeUrl(mapsUrl);

  // Geen CTA's? render niks
  if (!waHref && !telHref && !webHref && !mapHref) return null;

  return (
    <div className={className ?? "flex flex-wrap gap-2"}>
      {waHref && (
        <Button asChild variant="default">
          <Link
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              void trackClick({
                businessId,
                eventType: "whatsapp",
                path: pathname,
                lang,
                island: island ?? undefined,
              });
            }}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            WhatsApp
          </Link>
        </Button>
      )}

      {telHref && (
        <Button asChild variant="outline">
          <Link
            href={telHref}
            onClick={() => {
              void trackClick({
                businessId,
                eventType: "call",
                path: pathname,
                lang,
                island: island ?? undefined,
              });
            }}
          >
            <Phone className="mr-2 h-4 w-4" />
            Call
          </Link>
        </Button>
      )}

      {webHref && (
        <Button asChild variant="outline">
          <Link
            href={webHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              void trackClick({
                businessId,
                eventType: "website",
                path: pathname,
                lang,
                island: island ?? undefined,
              });
            }}
          >
            <Globe className="mr-2 h-4 w-4" />
            Website
          </Link>
        </Button>
      )}

      {mapHref && (
        <Button asChild variant="outline">
          <Link
            href={mapHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              void trackClick({
                businessId,
                eventType: "route",
                path: pathname,
                lang,
                island: island ?? undefined,
              });
            }}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Route
          </Link>
        </Button>
      )}
    </div>
  );
}