import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive";
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const styles =
      variant === "secondary"
        ? "bg-secondary text-secondary-foreground"
        : variant === "outline"
        ? "border border-border text-foreground bg-transparent"
        : variant === "destructive"
        ? "bg-destructive text-destructive-foreground"
        : "bg-primary text-primary-foreground";

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
          styles,
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";