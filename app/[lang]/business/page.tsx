import { redirect } from "next/navigation";

export default function BusinessRedirect({
  params,
}: {
  params: { lang: string };
}) {
  redirect(`/${params.lang}/businesses`);
}