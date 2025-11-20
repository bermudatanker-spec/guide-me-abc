// app/[lang]/business/dashboard/page.tsx
import DashboardClient from "./ui/DashboardClient";

export default function DashboardPage({
  params,
}: {
  params: { lang: string };
}) {
  const { lang } = params;

  // zolang we nog geen echte vertalingen hebben:
  const t = {};

  return <DashboardClient lang={lang} t={t} />;
}