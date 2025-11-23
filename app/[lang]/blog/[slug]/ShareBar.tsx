"use client";

import { useState, useEffect } from "react";
import { Facebook, Twitter, Link as LinkIcon } from "lucide-react";

export default function ShareBar({ title }: { title: string }) {
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      console.log("Link copied:", shareUrl);
    } catch (err) {
      console.error("Could not copy:", err);
    }
  }

  const btn =
    "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm border border-slate-200 bg-white hover:bg-slate-100 transition-colors";

  return (
    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-200">
      <span className="text-sm font-medium text-[#2d303b]">Share:</span>

      <a
        className={btn}
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
      >
        <Facebook className="h-4 w-4 text-[#4267B2]" />
      </a>

      <a
        className={btn}
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
          shareUrl
        )}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X (Twitter)"
      >
        <Twitter className="h-4 w-4 text-[#1DA1F2]" />
      </a>

      <button className={btn} onClick={copyLink} aria-label="Copy link">
        <LinkIcon className="h-4 w-4 text-[#2d303b]" />
      </button>
    </div>
  );
}
