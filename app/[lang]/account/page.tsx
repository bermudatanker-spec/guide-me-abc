import type { Locale } from "@/i18n/config";
import AccountClient from "./AccountClient";

type PageProps = {
    params: {lang: Locale };
};

export const dynamic = "force-dynamic";

export default function AccountPage({ params }: PageProps) {
    const { lang } = params;
    return <AccountClient lang={lang} />;
}