// app/page.tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  // Kies hier je default taal: "nl" of "en"
  redirect("/nl");
}
