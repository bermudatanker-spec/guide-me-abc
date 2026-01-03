"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import { supabaseBrowser } from "@/lib/supabase/browser";
import { getLangFromPath } from "@/lib/locale-path";

type Props = {
  className?: string;
  label?: string;
  onDone?: VoidFunction; // bv. menu sluiten
};

function safeHomeUrl(lang: string) {
  // Fix voor dev: redirects naar 0.0.0.0 zijn onbereikbaar in de browser
  const { protocol, hostname, port } = window.location;
  const safeHost = hostname === "0.0.0.0" ? "localhost" : hostname;
  const origin = `${protocol}//${safeHost}${port ? `:${port}` : ""}`;
  return `${origin}/${lang}`;
}

export default function LogoutButton({ className, label, onDone }: Props) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const lang = useMemo(() => getLangFromPath(pathname) ?? "en", [pathname]);
  const supabase = useMemo(() => supabaseBrowser(), []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    onDone?.();

    // ✅ hard redirect (werkt altijd + lost 0.0.0.0 probleem op)
    window.location.href = safeHomeUrl(lang);
  }, [supabase, lang, onDone]);

  return (
    <button type="button" onClick={handleLogout} className={className}>
      {label ?? (lang === "nl" ? "Uitloggen" : "Log out")}
    </button>
  );
}