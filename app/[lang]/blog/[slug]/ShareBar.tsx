"use client";

import { useMemo } from "react";
import { Facebook, Twitter, Link as LinkIcon } from "lucide-react";

export default function ShareBar({ title }: { title: string }) {
  const shareUrl = useMemo(
    () => (typeof window !== "undefined" ? window.location.href : ""),
    []
  );

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {}
  }

  const btn =
    "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-muted transition-colors";

  return (
    <div className="flex items-center gap-3 mb-8 pb-8 border-b border-border">
      <span className="text-sm font-medium text-foreground">Share:</span>

      <a
        className={btn}
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </a>

      <a
        className={btn}
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
      >
        <Twitter className="h-4 w-4" />
      </a>

      <button className={btn} onClick={copyLink} aria-label="Copy link">
        <LinkIcon className="h-4 w-4" />
      </button>
    </div>
  );
}