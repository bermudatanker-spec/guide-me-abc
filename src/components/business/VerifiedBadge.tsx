import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

type Props = {
  verified?: boolean | null;
  verifiedAt?: string | null;
  compact?: boolean;
};

export default function VerifiedBadge({ verified, verifiedAt, compact }: Props) {
  if (!verified) return null;

  const date = verifiedAt ? new Date(verifiedAt).toLocaleDateString() : null;

  return (
    <Badge
      className={
        compact
          ? "gap-1 bg-primary/10 text-primary hover:bg-primary/15"
          : "gap-1 bg-primary/10 text-primary hover:bg-primary/15 px-3 py-1"
      }
      title={date ? `Verified on ${date}` : "Verified"}
    >
      <CheckCircle2 className="h-3.5 w-3.5" />
      <span className="text-xs font-semibold">
        Verified{date ? ` • ${date}` : ""}
      </span>
    </Badge>
  );
}