"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { getLangFromPath } from "@/lib/locale-path";
import { langHref } from "@/lib/lang-href";
import { DICTS } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";

const MIN_LEN = 8;

function getTypeFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const qs = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return qs.get("type") || hash.get("type");
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const search = useSearchParams();

  const rawLang = getLangFromPath(pathname) || "en";
  const lang: Locale = isLocale(rawLang) ? rawLang : "en";
  const dict = DICTS[lang];

  const redirectedFrom = search.get("redirectedFrom") || "";
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // 🔑 Belangrijk: als dit een recovery-link is, sta de pagina toe
      const type = getTypeFromUrl();
      if (type === "recovery") {
        setLoading(false);
        return;
      }

      // Anders: alleen toegankelijk voor ingelogde gebruikers
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.replace(langHref(lang, "/business/auth"));
        return;
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (pw.length < MIN_LEN) {
      setMsg(dict.pw_too_short);
      return;
    }
    if (pw !== pw2) {
      setMsg(dict.pw_mismatch);
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) {
        const base =
          lang === "nl"
            ? "Kon wachtwoord niet bijwerken: "
            : lang === "pap"
            ? "No por a aktualisá kontraseña: "
            : lang === "es"
            ? "No se pudo actualizar la contraseña: "
            : "Could not update password: ";
        setMsg(base + error.message);
        return;
      }
      // Na succes is de sessie actief → doorsturen
      router.replace(redirectedFrom || langHref(lang, "/business/dashboard"));
    } catch (err: any) {
      const generic =
        lang === "nl"
          ? "Er ging iets mis."
          : lang === "pap"
          ? "Algu a bai robes."
          : lang === "es"
          ? "Algo fue mal."
          : "Something went wrong.";
      setMsg(err?.message ?? generic);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border shadow-sm p-6 space-y-4">
        <h1 className="text-xl font-semibold text-center">{dict.reset_title}</h1>

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="text-sm" htmlFor="pw">
            {dict.new_pw}
          </label>
          <div className="relative">
            <input
              id="pw"
              type={show ? "text" : "password"}
              className="w-full rounded-md border px-3 py-2 text-sm pr-10"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
              minLength={MIN_LEN}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 px-3 text-muted-foreground"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? dict.hide_pw : dict.show_pw}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <label className="text-sm" htmlFor="pw2">
            {dict.confirm_pw}
          </label>
          <input
            id="pw2"
            type={show ? "text" : "password"}
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            required
            minLength={MIN_LEN}
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-md bg-blue-600 text-white py-2 text-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? (dict.saving || "Saving…") : dict.save_pw}
          </button>
        </form>

        {msg && <p className="text-center text-sm text-red-600">{msg}</p>}
      </div>
    </main>
  );
}