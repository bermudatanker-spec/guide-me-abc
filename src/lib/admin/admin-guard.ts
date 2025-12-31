import { assertNoPublicSecrets } from "@/lib/env";
import { NextResponse } from "next/server";

export function requireGodmode(req: Request) {
  assertNoPublicSecrets();

  const token = req.headers.get("x-admin-token");
  const expected = process.env.GODMODE_TOKEN;

  if (!expected) {
    // Let op: NIET top-level throwen in routes → alleen runtime
    return { ok: false as const, res: NextResponse.json({ ok: false, error: "Missing GODMODE_TOKEN" }, { status: 500 }) };
  }

  if (!token || token !== expected) {
    return { ok: false as const, res: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  }

  return { ok: true as const };
}