"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ label = "Terug" }: { label?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-muted/40"
    >
      ← {label}
    </button>
  );
}