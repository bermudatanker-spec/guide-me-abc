"use client";

import { useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { getLangFromPath } from "@/lib/locale-path";
import { DICTS } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";

/** Bepaalt een veilige base URL voor redirectTo */
function getBaseUrl() {
  // Gebruik env wanneer beschikbaar (handig in Vercel/production)
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/$/, "");
  // Client fallback
  if (typeof window !== "undefined") return window.location.origin;
  // SSR fallback (dev)
  return "http://localhost:3000";
}

/** Eenvoudige, nette e-mailvalidatie */
function isValidEmailAddress(v: string) {
  return /^\S+@\S+\.\S+$/.test(v);
}

export default function ForgotPasswordPage() {
  const pathname = usePathname() ?? "/";
  const search = useSearchParams();

  // Taal veilig bepalen
  const rawLang = getLangFromPath(pathname) || "en";
  const lang: Locale = isLocale(rawLang) ? rawLang : "en";
  const dict = DICTS[lang];

  // Als je iemand straks wilt terugsturen na reset
  const redirectedFrom = search.get("redirectedFrom") || "";

  const supabase = useMemo(() => supabaseBrowser(), []);
  const baseUrl = getBaseUrl();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false); // succesvolle state
  const [msg, setMsg] = useState<string | null>(null);

  const normalizedEmail = email.trim().toLowerCase();
  const emailLooksOk = isValidEmailAddress(normalizedEmail);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || submitted) return;

    setMsg(null);

    if (!emailLooksOk) {
      // Korte validatie in 4 talen (geen extra i18n key nodig)
      const invalid =
        lang === "nl"
          ? "Voer een geldig e-mailadres in."
          : lang === "pap"
          ? "Yena un email válido."
          : lang === "es"
          ? "Introduce un correo válido."
          : "Enter a valid email.";
      setMsg(invalid);
      return;
    }

    try {
      setLoading(true);

      // Stuur gebruiker na klikken op mail-link naar /auth/callback
      // -> die herkent type=recovery en stuurt door naar /business/reset-password
      const redirectTo =
        `${baseUrl}/auth/callback?` +
        new URLSearchParams({
          type: "recovery",      // expliciet zetten is veilig
          lang,                  // voor UI-taal
          ...(redirectedFrom ? { redirectedFrom } : {}),
        }).toString();

      const { error } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        { redirectTo }
      );

      if (error) {
        const base =
          lang === "nl"
            ? "Kon reset-mail niet versturen: "
            : lang === "pap"
            ? "No por a manda email pa reset: "
            : lang === "es"
            ? "No se pudo enviar el correo de restablecimiento: "
            : "Failed to send reset email: ";
        setMsg(base + error.message);
      } else {
        // Succes: toon duidelijke melding en vergrendel formulier
        setSubmitted(true);
        setMsg(dict.sent_check_email);
      }
    } catch (err: any) {
      const generic =
        lang === "nl"
          ? "Er ging iets mis."
          : lang === "pap"
          ? "Algu a bai robes."
          : lang === "es"
          ? "Algo salió mal."
          : "Something went wrong.";
      setMsg(err?.message ?? generic);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border shadow-sm p-6 space-y-4">
        <h1 className="text-xl font-semibold text-center">{dict.forgot_title}</h1>
        <p className="text-sm text-muted-foreground text-center">{dict.forgot_sub}</p>

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="text-sm" htmlFor="email">
            {dict.email}
          </label>

          <input
            id="email"
            type="email"
            className={`w-full rounded-md border px-3 py-2 text-sm ${
              normalizedEmail && !emailLooksOk ? "border-red-400" : "border-gray-300"
            }`}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            disabled={submitted}   // vergrendel veld na succes
          />

          <button
            type="submit"
            disabled={loading || !emailLooksOk || submitted}
            className="w-full rounded-md bg-blue-600 text-white py-2 text-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? (dict.sending || "Sending…") : dict.send_reset_link}
          </button>
        </form>

        {msg && (
          <p
            className={`text-center text-sm ${
              // heuristiek: rood bij duidelijke fout
              /kon|failed|no se pudo|no por|error/i.test(msg) ? "text-red-600" : "text-muted-foreground"
            }`}
          >
            {msg}
          </p>
        )}
      </div>
    </main>
  );
}