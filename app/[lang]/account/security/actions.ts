"use server";

import { authenticator } from "otplib";
import * as QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";

/**
 * 1️⃣ Start MFA setup (secret + QR-code genereren)
 */
export async function startMfaSetup() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Niet ingelogd");

  // Geheim genereren
  const secret = authenticator.generateSecret();

  // otpauth URI voor Google Authenticator / Authy
  const otpauth = authenticator.keyuri(
    user.email!,
    "Guide Me ABC",
    secret
  );

  // 👇 Hier gebruiken we qrcode echt
  const qrDataUrl = await QRCode.toDataURL(otpauth);

  // Secret opslaan in profiles
  await supabase
    .from("profiles")
    .update({ mfa_totp_secret: secret })
    .eq("id", user.id);

  return { qrDataUrl };
}

/**
 * 2️⃣ Bevestig MFA setup (user voert 6-cijferige code in)
 */
export async function confirmMfaSetup(token: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Niet ingelogd");

  const { data, error } = await supabase
    .from("profiles")
    .select("mfa_totp_secret")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("MFA profiel ophalen failed:", error);
    throw new Error("Kon MFA-profiel niet ophalen");
  }

  const profile = data as { mfa_totp_secret: string | null } | null;
  const secret = profile?.mfa_totp_secret;

  if (!secret) {
    throw new Error("Geen MFA secret gevonden");
  }

  const isValid = authenticator.verify({
    token,
    secret,
  });

  if (!isValid) {
    throw new Error("Ongeldige code");
  }

  await supabase
    .from("profiles")
    .update({ is_mfa_enabled: true })
    .eq("id", user.id);

  return { success: true };
}