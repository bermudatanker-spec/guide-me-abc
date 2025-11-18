// app/[lang]/business/dashboard/page.tsx
import DashboardClient from "./ui/DashboardClient";

export default async function DashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  // Als je nog geen echte vertalingen hebt:
  const t = {};

  return <DashboardClient lang={lang} t={t} />;
}