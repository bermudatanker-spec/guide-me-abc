"use client";

import { useMemo, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { getLangFromPath } from "@/lib/locale-path";
import { DICTS } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";

function isOkPassword(pw: string) {
  return pw.trim().length >= 6;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const search = useSearchParams();

  const rawLang = getLangFromPath(pathname) || "en";
  const lang: Locale = isLocale(rawLang) ? rawLang : "en";
  const dict = DICTS[lang];

  const getParam = (key: string) => search?.get(key) ?? "";

  // code/token komt normaal binnen via /auth/callback → redirect
  const redirectedFrom = getParam("redirectedFrom");
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || done) return;

    setMsg(null);

    if (!isOkPassword(password)) {
      const m =
        lang === "nl"
          ? "Wachtwoord moet minstens 6 tekens zijn."
          : lang === "pap"
          ? "Password mester tin minimo 6 karakter."
          : lang === "es"
          ? "La contraseña debe tener al menos 6 caracteres."
          : "Password must be at least 6 characters.";
      setMsg(m);
      return;
    }

    if (password !== confirm) {
      const m =
        lang === "nl"
          ? "Wachtwoorden komen niet overeen."
          : lang === "pap"
          ? "E passwordnan no ta meskos."
          : lang === "es"
          ? "Las contraseñas no coinciden."
          : "Passwords do not match.";
      setMsg(m);
      return;
    }

    try {
      setLoading(true);

      // Bij een recovery-flow is de gebruiker hier al ingelogd (na /auth/callback)
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        const base =
          lang === "nl"
            ? "Kon wachtwoord niet aanpassen: "
            : lang === "pap"
            ? "No por kambia password: "
            : lang === "es"
            ? "No se pudo cambiar la contraseña: "
            : "Failed to update password: ";
        setMsg(base + error.message);
        return;
      }

      setDone(true);

      const ok =
        lang === "nl"
          ? "Je wachtwoord is aangepast. Je kunt nu inloggen."
          : lang === "pap"
          ? "Bo password a kambia. Awor bo por login."
          : lang === "es"
          ? "Tu contraseña ha sido actualizada. Ya puedes iniciar sesión."
          : "Your password has been updated. You can now sign in.";

      setMsg(ok);

      // even kleine delay zodat de gebruiker het leest
      setTimeout(() => {
        router.replace(
          redirectedFrom || `/${lang}/business/auth?tab=signin`
        );
      }, 2000);
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
        <h1 className="text-xl font-semibold text-center">
          {dict.reset_title ?? "Reset your password"}
        </h1>
        <p className="text-sm text-muted-foreground text-center">
          {dict.reset_sub ?? "Choose a new password to access your account."}
        </p>

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="text-sm" htmlFor="pw">
            {dict.new_password ?? "New password"}
          </label>
          <input
            id="pw"
            type="password"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            disabled={done}
          />

          <label className="text-sm" htmlFor="pw2">
            {dict.confirm_password ?? "Confirm password"}
          </label>
          <input
            id="pw2"
            type="password"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            disabled={done}
          />

          <button
            type="submit"
            disabled={loading || done}
            className="w-full rounded-md bg-blue-600 text-white py-2 text-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {loading
              ? dict.saving || "Saving…"
              : dict.save_new_password || "Save new password"}
          </button>
        </form>

        {msg && (
          <p className="text-center text-sm text-muted-foreground">{msg}</p>
        )}
      </div>
    </main>
  );
}
