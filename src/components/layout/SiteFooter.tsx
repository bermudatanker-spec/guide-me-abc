// src/components/layout/SiteFooter.tsx
import Link from "next/link";
import { langHref } from "@/lib/lang-href";

type Props = {
  lang?: string;
};

export default function SiteFooter({ lang = "en" }: Props) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-background/90">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 md:grid-cols-3 text-sm">
          <div>
            <p className="font-semibold text-foreground">Guide Me ABC</p>
            <p className="mt-2 text-muted-foreground">
              Jouw gids voor lokale bedrijven, to-do&apos;s en hidden gems op
              Aruba, Bonaire en Curaçao.
            </p>
          </div>

          <div>
            <p className="font-semibold text-foreground">Platform</p>
            <div className="mt-2 flex flex-col gap-1 text-muted-foreground">
              <Link href={langHref(lang, "/islands")} className="hover:text-foreground">
                Eilanden
              </Link>
              <Link href={langHref(lang, "/businesses")} className="hover:text-foreground">
                Bedrijven
              </Link>
              <Link href={langHref(lang, "/blog")} className="hover:text-foreground">
                Blog
              </Link>
              <Link href={langHref(lang, "/faq")} className="hover:text-foreground">
                FAQ
              </Link>
            </div>
          </div>

          <div>
            <p className="font-semibold text-foreground">Zakelijk</p>
            <div className="mt-2 flex flex-col gap-1 text-muted-foreground">
              <Link href={langHref(lang, "/for-business")} className="hover:text-foreground">
                Voor ondernemers
              </Link>
              <Link href="/privacy" className="hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground">
                Voorwaarden
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-border/60 pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Guide Me ABC. All rights reserved.</p>
          <p className="sm:text-right">
            Gemaakt met ❤️ voor Aruba, Bonaire &amp; Curaçao.
          </p>
        </div>
      </div>
    </footer>
  );
}