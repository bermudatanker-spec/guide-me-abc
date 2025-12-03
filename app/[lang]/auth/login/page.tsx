import type { Locale } from "@/i18n/config";
import LoginClient from "./LoginClient";

type PageProps = {
    params: {lang: Locale };
};

export const dynamic = "force-dynamic";

export default function SignupPage({ params }: PageProps) {
    const { lang } = params;
    return <LoginClient lang={lang} />;
}