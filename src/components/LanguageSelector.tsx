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
import { useLanguage } from "@/hooks/useLanguage";
import type { Lang } from "@/hooks/useLanguage";
import { getLangFromPath, replaceLangInPath } from "@/lib/locale-path";

const LABEL: Record<Lang, string> = {
  en: "English",
  nl: "Nederlands",
  pap: "Papiamentu",
  es: "Español",
};

const isLang = (v: string): v is Lang =>
  (["en", "nl", "pap", "es"] as const).includes(v as Lang);

export default function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const routeLang = getLangFromPath(pathname);
  const { setLanguage } = useLanguage();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ✅ Altijd controlled: geef fallback value
  const value = mounted ? routeLang : routeLang; // <-- geen undefined meer

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (!isLang(v)) return;
        setLanguage(v);
        const next = replaceLangInPath(pathname, v);
        router.replace(next);
      }}
    >
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder={LABEL[value]} />
      </SelectTrigger>

      <SelectContent>
        {(Object.keys(LABEL) as Lang[]).map((code) => (
          <SelectItem key={code} value={code}>
            {LABEL[code]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}