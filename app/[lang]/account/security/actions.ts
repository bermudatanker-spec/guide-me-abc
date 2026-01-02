"use server";

import { authenticator } from "otplib";
import QRCode from "qrcode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProfileRow = {
  mfa_totp_secret: string | null;
  is_mfa_enabled: boolean | null;
};

/**
 * Helper: haal Supabase + ingelogde user op.
 * Werkt ook als createSupabaseServerClient() async is.
 */
async function getSupabaseAndUser() {
    const supabase = (await (createSupabaseServerClient as any)()) as any;

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("[mfa] getUser error", error);
    throw new Error("Kon gebruiker niet ophalen");
  }

  const user = data?.user;
  if (!user) {
    throw new Error("Niet ingelogd");
  }

  return { supabase, user };
}

/**
 * 1️⃣ Start MFA setup (secret + QR-code genereren)
 */
export async function startMfaSetup() {
  const { supabase, user } = await getSupabaseAndUser();

  // Geheim genereren
  const secret = authenticator.generateSecret();

  // otpauth URI voor Google Authenticator / Authy
  const otpauth = authenticator.keyuri(
    user.email ?? "",
    "Guide Me ABC",
    secret,
  );

  // QR-code als Data URL
  const qrDataUrl = await QRCode.toDataURL(otpauth);

  // Secret opslaan in profiles
  const { error } = await supabase
    .from("profiles")
    .update({
      mfa_totp_secret: secret,
      is_mfa_enabled: false,
    })
    .eq("id", user.id);

  if (error) {
    console.error("[mfa] kon secret niet opslaan", error);
    throw new Error("Kon MFA-secret niet opslaan");
  }

  return { qrDataUrl };
}

/**
 * 2️⃣ Bevestig MFA setup (user voert 6-cijferige code in)
 */
export async function confirmMfaSetup(token: string) {
  const { supabase, user } = await getSupabaseAndUser();

  const { data, error } = await supabase
    .from("profiles")
    .select("mfa_totp_secret")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("[mfa] profiel ophalen failed", error);
    throw new Error("Kon MFA-profiel niet ophalen");
  }

  const profile = data as ProfileRow | null;
  const secret = profile?.mfa_totp_secret;

  if (!secret) {
    throw new Error("Geen MFA-secret gevonden");
  }

  const isValid = authenticator.verify({ token, secret });

  if (!isValid) {
    throw new Error("Ongeldige code");
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ is_mfa_enabled: true })
    .eq("id", user.id);

  if (updateError) {
    console.error("[mfa] status updaten failed", updateError);
    throw new Error("Kon MFA-status niet bijwerken");
  }

  return { success: true };
}