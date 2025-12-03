export async function verifyMfa(userId: string, token: string) {
  // zelfde verify als bij setup, maar nu gewoon elke login
  // bij success:
  // - zet een secure cookie "mfa_verified=true" voor deze sessie
}