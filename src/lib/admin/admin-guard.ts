import { NextResponse } from "next/server";

type GuardOk = { ok: true };
type GuardFail = { ok: false; res: NextResponse };

export function requireGodmode(req: Request): GuardOk | GuardFail {
  const expected = process.env.GODMODE_TOKEN;

  // Als je geen token hebt gezet in env: altijd blokkeren (veilig)
  if (!expected) {
    return {
      ok: false,
      res: NextResponse.json({ ok: false, error: "Server misconfig: GODMODE_TOKEN missing" }, { status: 500 }),
    };
  }

  const token = req.headers.get("x-admin-token")?.trim();

  if (!token || token !== expected) {
    return {
      ok: false,
      res: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { ok: true };
}