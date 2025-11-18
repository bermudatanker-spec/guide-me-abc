"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

/**
 * ✅ Label component — consistent met de rest van je UI
 * - Gebruikt Tailwind voor spacing, kleur en typografie
 * - Ondersteunt `required` state met een sterretje
 */
const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className
        )}
        {...props}
      >
        {children}
        {props?.["aria-required"] && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>
    );
  }
);

Label.displayName = "Label";

export { Label };