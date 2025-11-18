"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Eén plek voor je gradients (makkelijk te tunen) */
const G = {
  turquoise: "bg-[linear-gradient(90deg,#00D4D8_0%,#00A1C9_100%)] shadow-[0_6px_18px_rgba(0,169,201,.35)]",
  coral:     "bg-[linear-gradient(90deg,#FF7A4F_0%,#FF946C_100%)] shadow-[0_6px_18px_rgba(255,122,79,.32)]",
  mint:      "bg-[linear-gradient(90deg,#34E1BD_0%,#20C997_100%)] shadow-[0_6px_18px_rgba(32,201,151,.28)]",
  lilac:     "bg-[linear-gradient(90deg,#8B5CF6_0%,#22D3EE_100%)] shadow-[0_6px_18px_rgba(139,92,246,.28)]",
  sun:       "bg-[linear-gradient(90deg,#FFC041_0%,#FF8F3A_100%)] shadow-[0_6px_18px_rgba(255,160,64,.28)]",
  slate:     "bg-[linear-gradient(90deg,#1F3A5F_0%,#2A5C8A_100%)] shadow-[0_6px_18px_rgba(31,58,95,.28)]",
};

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-semibold transition-all " +
    "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-60 active:scale-[0.98] aria-busy:cursor-progress",
  {
    variants: {
      variant: {
        // shadcn basis
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",

        // outlines
        outline: "border border-border bg-background text-foreground hover:border-[#00D4D8] hover:bg-background/60",
        outlineSoft: "border border-border bg-transparent text-foreground hover:bg-muted/40",

        // gradients (sitewide)
        primaryGrad: `text-white ${G.turquoise} hover:brightness-[1.07]`,
        hero:        `text-white ${G.turquoise} hover:brightness-[1.07]`, // alias
        coralGrad:   `text-white ${G.coral} hover:brightness-[1.07]`,
        mintGrad:    `text-white ${G.mint} hover:brightness-[1.07]`,
        lilacGrad:   `text-white ${G.lilac} hover:brightness-[1.07]`,
        sunGrad:     `text-white ${G.sun} hover:brightness-[1.07]`,
        slateGrad:   `text-white ${G.slate} hover:brightness-[1.07]`,

        // wit op donkere hero’s
        whiteOnDark:
          "text-slate-900 bg-white shadow-[0_8px_22px_rgba(0,0,0,.12)] hover:brightness-[1.03]",
      },
      size: {
        sm: "h-9 px-3",
        default: "h-11 px-5",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10 p-0",
      },
      fullWidth: { false: "", true: "w-full" },
      loading: { false: "", true: "relative" },
    },
    defaultVariants: {
      variant: "primaryGrad",
      size: "default",
      fullWidth: false,
      loading: false,
    },
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}

function Spinner() {
  return (
    <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, isLoading = false, asChild = false, disabled, children, ...props }, ref) => {
    const computedDisabled = disabled ?? isLoading;
    const content = (
      <span className="inline-flex items-center">
        {isLoading && <Spinner />}
        {children}
      </span>
    );

    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, fullWidth, loading: isLoading ? true : false }), className)}
          aria-busy={isLoading || undefined}
          // @ts-expect-error: anchors/divs kennen 'disabled' niet; visueel oké
          disabled={computedDisabled}
          {...props}
        >
          {content}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, loading: isLoading ? true : false }), className)}
        aria-busy={isLoading || undefined}
        disabled={computedDisabled}
        {...props}
      >
        {content}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };