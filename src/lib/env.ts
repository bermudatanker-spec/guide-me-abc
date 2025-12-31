export function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

/**
 * Safety: server-only secrets mogen nooit NEXT_PUBLIC_ zijn
 * -> Als iemand dat toch doet, laten we de build/runtime falen.
 */
export function assertNoPublicSecrets() {
  const bad = [
    "NEXT_PUBLIC_GODMODE_TOKEN",
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET",
  ].filter((k) => process.env[k]);

  if (bad.length) {
    throw new Error(
      `Public secret(s) detected: ${bad.join(", ")}. Remove NEXT_PUBLIC_ version(s) immediately.`
    );
  }
}