import type { Locale } from "@/i18n/config";
import SignupClient from "./SignupClient";

type PageProps = {
  params: Promise<{ lang: string }>; // Must be a Promise
};

export default async function SignupPage({ params }: PageProps) {
  const { lang } = await params; // Must be awaited
  return <SignupClient lang={lang as Locale} />;
}