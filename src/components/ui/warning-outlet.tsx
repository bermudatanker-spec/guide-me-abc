"use client";

import * as React from "react";

export function WarningOutline({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full rounded-xl border border-red-600 bg-white/80 text-red-800 px-4 py-3 shadow-sm backdrop-blur-md flex items-start gap-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mt-0.5 shrink-0 text-red-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-.01-10a9 9 0 110 18 9 9 0 010-18z"
        />
      </svg>
      <p className="text-sm font-medium leading-tight">{children}</p>
    </div>
  );
}