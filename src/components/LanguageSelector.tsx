"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLangFromPath, replaceLangInPath } from "@/lib/locale-path";

/** We houden de type-def hier local zodat TS geen gezeur geeft over imports. */
type Lang = "en" | "nl" | "pap" | "es";

const LABEL: Record<Lang, string> = {
  en: "English",
  nl: "Nederlands",
  pap: "Papiamentu",
  es: "Español",
};

const ALL_LANGS: Lang[] = ["en", "nl", "pap", "es"];

const isLang = (v: string): v is Lang =>
  (ALL_LANGS as readonly string[]).includes(v as Lang);

export default function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  // taal uit de URL ( /nl/…, /en/… )
  const routeLang = getLangFromPath(pathname) as Lang;

  // ⛑ client-only render om hydration mismatch te voorkomen
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const value = routeLang;

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (!isLang(v)) return;
        const next = replaceLangInPath(pathname, v);
        router.replace(next);
      }}
    >
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder={LABEL[value]} />
      </SelectTrigger>

      <SelectContent>
        {ALL_LANGS.map((code) => (
          <SelectItem key={code} value={code}>
            {LABEL[code]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}