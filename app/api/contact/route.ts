import { NextResponse } from "next/server";
import { z } from "zod";

const ContactSchema = z.object({
  lang: z.string().optional(),
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(2),
  message: z.string().min(10),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = ContactSchema.parse(json);

    // TODO: hier kun je opslaan in Supabase of email sturen
    console.log("[contact]", {
      lang: data.lang,
      name: data.name,
      email: data.email,
      subject: data.subject,
      messageLen: data.message.length,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}