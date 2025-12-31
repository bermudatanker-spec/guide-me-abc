// app/[lang]/account/layout.tsx
import type { ReactNode } from "react";
import BackButton from "@/components/BackButton";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10">
      <div className="mb-6">
        <BackButton label="Terug" />
      </div>

      {children}
    </div>
  );
}