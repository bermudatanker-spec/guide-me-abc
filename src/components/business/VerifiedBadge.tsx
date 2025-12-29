import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

type Props = {
  verified: boolean | null;
  verifiedAt?: string | null;
  compact?: boolean;
};

export default function VerifiedBadge({
  verified,
  verifiedAt,
  compact = false,
}: Props) {
  if (verified) {
    return (
      <span
        className={`
          inline-flex items-center gap-1 rounded-full
          bg-emerald-500/15 text-emerald-700
          ${compact ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"}
          font-semibold
        `}
        title={
          verifiedAt
            ? `Verified on ${new Date(verifiedAt).toLocaleDateString()}`
            : "Verified business"
        }
      >
        ✔ Verified
      </span>
    );
  }

  // 👇 NIET verified → trots maar eerlijk
  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full
        bg-muted text-muted-foreground
        ${compact ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"}
        font-medium
        cursor-help
      `}
      title="Verification increases trust and visibility"
    >
      ⏳ Not verified
    </span>
  );
}